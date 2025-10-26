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
      contents: [
        {
          role: "user",
          parts: [
            {
            text: `
                Use the given context and subtopics to write clear, simple, slightly fun explanations with examples.
                Make each explanation between 40–100 words.

                Return only a JSON object in this format:
                {
                  "explanations": ["...", "...", "..."]
                }

                Context: AI is basically making machines behave like humans...
                Subtopics: ["What is Artificial Intelligence?", "Origin and History of AI", "Narrow AI vs. General AI", "Intelligent Agents in AI", "AI Search Techniques", "Introduction to Machine Learning", "Knowledge Representation in AI"]
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
                description:
                  "A clear, easy-to-understand explanation of each subtopic with examples in a slightly fun tone in the markdown format with proper markdown syntax and formatting syntax based on the context(example <br> for new line (**bold**), (*italic*), lists <ul><li></li></ul>, and all other formatting features strictly based on the context.",
                type: "string",
                minLength: 40,
                maxLength: 100,
              },
            },
          },
          required: ["explanations"],
        },
      },
    });

    const text = response.text ?? "";
    if (!text) return Response.json({ text: "No response from AI" });

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
