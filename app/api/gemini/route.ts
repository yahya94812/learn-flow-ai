import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: Request) {
  try {
    console.log("API Route called");

    // Check API key
    if (!apiKey || !ai) {
      console.error("Missing GEMINI_API_KEY");
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY on server" },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { combinedText, prompt } = body;

    if (!combinedText) {
      console.error("Missing combinedText in request");
      return NextResponse.json(
        { error: "Missing combinedText in request" },
        { status: 400 }
      );
    }

    console.log("Combined text length:", combinedText.length);
    console.log("Prompt:", prompt);

    // Utility: safely extract JSON from model responses that sometimes include code fences
    const parseJsonSafe = (raw: string) => {
      let cleaned = (raw || "").trim();
      // strip BOM if present
      if (cleaned.charCodeAt(0) === 0xfeff) cleaned = cleaned.slice(1);
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      const firstParse = JSON.parse(cleaned);
      // Sometimes model returns a JSON string that itself contains JSON
      if (typeof firstParse === "string") {
        return JSON.parse(firstParse);
      }
      return firstParse;
    };

    // Step 1: Get main topic and subtopics
    console.log("Fetching subtopics...");

    let subtopicsResponse;
    try {
      subtopicsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Task: From the provided Context, derive a single main topic and 6–12 concise subtopics.

Output format: Return ONLY a JSON object with exactly these properties:
{
  "topic": string,
  "subtopics": string[]
}

Rules:
- Output JSON only. No markdown, no commentary, no headings, no code fences.

User preference (optional): ${prompt || "(none)"}
Context: ${combinedText}
               `,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The main topic provided by the user.",
              },
              subtopics: {
                type: "array",
                description:
                  "A list of smaller subtopics related to the main topic. Each subtopic should be simple and easy to explain in under 100 words.",
                items: {
                  type: "string",
                  description:
                    "A subtopic name or phrase under 20 words.",
                },
              },
            },
            required: ["topic", "subtopics"],
          },
        },
      });
    } catch (apiError) {
      console.error("Error calling Gemini API (subtopics):", apiError);
      return NextResponse.json(
        {
          error:
            "Failed to generate subtopics: " +
            (apiError.message || "Unknown error"),
        },
        { status: 500 }
      );
    }

    // Parse subtopics response
    let subtopicsData;
    try {
      // Prefer new SDK convenience field if available, else fall back
      const responseText =
        typeof (subtopicsResponse as any).text === "string"
          ? (subtopicsResponse as any).text
          : (await (subtopicsResponse as any).response?.text?.()) || "";
      console.log("Subtopics response (raw):", responseText);
      try {
        subtopicsData = parseJsonSafe(responseText);
      } catch (e) {
        // Fallback: try to extract the first JSON object substring
        const start = responseText.indexOf("{");
        const end = responseText.lastIndexOf("}") + 1;
        if (start >= 0 && end > start) {
          const candidate = responseText.slice(start, end);
          subtopicsData = JSON.parse(candidate);
        } else {
          throw e;
        }
      }
    } catch (parseError) {
      console.warn(
        "First parse of subtopics failed, retrying with STRICT JSON prompt..."
      );
      // One-time retry with stricter instruction
      try {
        const retry = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `STRICT JSON ONLY.
Return exactly this JSON shape and nothing else: {"topic": string, "subtopics": string[]}
Ensure 6–12 subtopics, short phrases, no duplicates.

User preference (optional): ${prompt || "(none)"}
Context: ${combinedText}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                topic: { type: "string" },
                subtopics: { type: "array", items: { type: "string", } },
              },
              required: ["topic", "subtopics"],
            },
          },
        });

        const retryText =
          typeof (retry as any).text === "string"
            ? (retry as any).text
            : (await (retry as any).response?.text?.()) || "";
        console.log("Subtopics retry response (raw):", retryText);
        subtopicsData = parseJsonSafe(retryText);
      } catch (retryErr) {
        console.error("Subtopics retry failed:", retryErr);
        const previewPayload = await (async () => {
          try {
            const responseText =
              typeof (subtopicsResponse as any).text === "string"
                ? (subtopicsResponse as any).text
                : (await (subtopicsResponse as any).response?.text?.()) || "";
            return responseText.slice(0, 300);
          } catch (_) {
            return undefined;
          }
        })();
        return NextResponse.json(
          {
            error: "Failed to parse AI response for subtopics",
            detailsPreview: previewPayload,
          },
          { status: 500 }
        );
      }
    }

    const mainTopic = subtopicsData.topic || "Study Material";
    const subtopics = Array.isArray(subtopicsData.subtopics)
      ? subtopicsData.subtopics
          .map((s: any) =>
            typeof s === "string" ? s : s?.title || s?.name || ""
          )
          .filter(Boolean)
      : [];

    if (!subtopics || subtopics.length === 0) {
      console.error("No subtopics generated");
      return NextResponse.json(
        { error: "No subtopics were generated" },
        { status: 500 }
      );
    }

    console.log("Main topic:", mainTopic);
    console.log("Subtopics count:", subtopics.length);

    // Step 2: Get explanations for each subtopic
    console.log("Fetching explanations...");

    let explanationsResponse;
    try {
      explanationsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Task: For each subtopic, write a clear, slightly fun explanation with examples (40–120 words). Use simple language. with point style when possible.

Output format: Return ONLY a JSON object with exactly these properties:
{
  "explanations": string[]
}

Rules:
- Output JSON only. no commentary, no code fences.
- explanations.length must equal subtopics.length and keep the same order.

User preference (optional): ${prompt || "(none)"}
Context: ${combinedText}
Main Topic: ${mainTopic}
Subtopics: ${JSON.stringify(subtopics)}
               `,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              explanations: {
                type: "array",
                items: {
                  type: "string",
                  description:
                    "A clear, easy-to-understand explanation of each subtopic with examples in a slightly fun tone in the markdown format with proper markdown syntax and formatting syntax based on the context, in points style.",
                },
              },
            },
            required: ["explanations"],
          },
        },
      });
    } catch (apiError) {
      console.error("Error calling Gemini API (explanations):", apiError);
      return NextResponse.json(
        {
          error:
            "Failed to generate explanations: " +
            (apiError.message || "Unknown error"),
        },
        { status: 500 }
      );
    }

    // Parse explanations response
    let explanationsData;
    try {
      const responseText =
        typeof (explanationsResponse as any).text === "string"
          ? (explanationsResponse as any).text
          : (await (explanationsResponse as any).response?.text?.()) || "";
      console.log("Explanations response (raw):", responseText);
      try {
        explanationsData = parseJsonSafe(responseText);
      } catch (e) {
        const start = responseText.indexOf("{");
        const end = responseText.lastIndexOf("}") + 1;
        if (start >= 0 && end > start) {
          const candidate = responseText.slice(start, end);
          explanationsData = JSON.parse(candidate);
        } else {
          throw e;
        }
      }
    } catch (parseError) {
      console.error("Failed to parse explanations response:", parseError);
      const previewPayload = await (async () => {
        try {
          const responseText =
            typeof (explanationsResponse as any).text === "string"
              ? (explanationsResponse as any).text
              : (await (explanationsResponse as any).response?.text?.()) || "";
          return responseText.slice(0, 300);
        } catch (_) {
          return undefined;
        }
      })();
      return NextResponse.json(
        {
          error: "Failed to parse AI response for explanations",
          detailsPreview: previewPayload,
        },
        { status: 500 }
      );
    }

    const explanations = Array.isArray(explanationsData.explanations)
      ? explanationsData.explanations.map((e: any) => String(e))
      : [];

    if (!explanations || explanations.length === 0) {
      console.error("No explanations generated");
      return NextResponse.json(
        { error: "No explanations were generated" },
        { status: 500 }
      );
    }

    console.log("Explanations count:", explanations.length);

    // Return success response
    return NextResponse.json({
      success: true,
      mainTopic: mainTopic,
      subtopics: subtopics,
      explanations: explanations,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
