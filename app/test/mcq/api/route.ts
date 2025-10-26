import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return new Response("Missing GEMINI_API_KEY on server", { status: 500 });
    }

    const body = await request.json();
    const { topic, context, numQuestions = 5 } = body;

    if (!topic && !context) {
      return new Response("Missing topic or context", { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{
            text: `Create ${numQuestions} multiple choice questions about: ${topic || context}

Requirements:
- Each question should have 3-5 options
- Mark one option as the correct answer
- Include a helpful hint
- Set difficulty as easy, medium, or hard

Return ONLY valid JSON in this exact format with no extra text:
{
  "questions": [
    {
      "question": "What is photosynthesis?",
      "options": ["Process A", "Process B", "Process C"],
      "answer": "Process B",
      "hint": "Think about plants and sunlight",
      "difficulty": "easy"
    }
  ]
}`
          }],
        },
      ],
    });

    // Get response text
    let text = "";
    try {
      text = response.text ?? "";
    } catch (err) {
      console.error("Error getting text from response:", err);
      
      // Try alternative methods to get content
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          text = candidate.content.parts
            .map((part: any) => part.text || "")
            .join("");
        }
      }
    }
    
    if (!text) {
      console.error("Empty response from Gemini");
      return new Response("No response from AI model", { status: 500 });
    }

    console.log("=== RAW RESPONSE ===");
    console.log(text);
    console.log("=== END RAW RESPONSE ===");

    // Aggressive cleaning
    let cleaned = text.trim();
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    
    // Remove any text before first {
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }
    
    // Remove any text after last }
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }

    console.log("=== CLEANED JSON ===");
    console.log(cleaned);
    console.log("=== END CLEANED ===");

    // Try to parse
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr);
      console.error("Attempted to parse:", cleaned.substring(0, 500));
      
      // Last resort: try to extract JSON using regex
      const jsonMatch = cleaned.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Trying regex extraction...");
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Regex extraction also failed");
          return new Response(
            `Failed to parse AI response. Raw response: ${text.substring(0, 200)}...`,
            { status: 500 }
          );
        }
      } else {
        return new Response(
          `No valid JSON found in response. Raw: ${text.substring(0, 200)}...`,
          { status: 500 }
        );
      }
    }

    // Validate structure
    if (!parsed || typeof parsed !== "object") {
      return new Response("Parsed result is not an object", { status: 500 });
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      console.error("Invalid structure - no questions array:", parsed);
      return new Response("Invalid response structure - missing questions array", { status: 500 });
    }

    // Validate and clean questions
    const validQuestions = parsed.questions.filter((q: any) => {
      const isValid = 
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length >= 3 &&
        typeof q.answer === "string";
      
      if (!isValid) {
        console.warn("Invalid question filtered out:", q);
      }
      return isValid;
    });

    if (validQuestions.length === 0) {
      console.error("No valid questions after filtering");
      return new Response("No valid questions generated", { status: 500 });
    }

    console.log(`Successfully generated ${validQuestions.length} questions`);
    return Response.json({ questions: validQuestions });

  } catch (err: any) {
    console.error("=== FULL ERROR ===");
    console.error(err);
    console.error("=== END ERROR ===");
    
    const message = err?.message || "Failed to generate questions";
    return new Response(`Server error: ${message}`, { status: 500 });
  }
}