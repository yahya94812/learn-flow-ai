import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export async function GET() {
  try {
    if (!apiKey) {
      return new Response("Missing GEMINI_API_KEY on server", { status: 500 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            explanation: {
              type: "string",
              description: "A brief explanation of how AI works",
            },
            keyPoints: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Key points about AI",
            },
          },
          required: ["explanation", "keyPoints"],
        },
      },
    });

    const text = response.text ?? "";
    if (!text) {
      return Response.json({ text: "No response from AI" });
    }

    // Clean potential markdown code blocks
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);
    return Response.json(parsed);
  } catch (err: any) {
    console.error("Parse error:", err);
    const message = err?.message || "Failed to generate content";
    return new Response(message, { status: 500 });
  }
}
