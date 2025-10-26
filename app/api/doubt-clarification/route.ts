import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { doubt, context, conversationHistory } = await request.json();

    // Build conversation history for context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .map((msg: any) => 
          `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}`
        )
        .join("\n");
    }

    const prompt = `You are a helpful and patient tutor. A student is studying the following content:

STUDY CONTENT:
${context}

${conversationContext ? `PREVIOUS CONVERSATION:\n${conversationContext}\n` : ""}

STUDENT'S DOUBT:
${doubt}

Please provide a clear, concise, and friendly clarification to help the student understand. Use simple language and examples where appropriate. If the doubt is related to the study content, reference it specifically. Keep your response focused and educational.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const clarification = response.text;

    return NextResponse.json({ clarification });
  } catch (error) {
    console.error("Error generating clarification:", error);
    return NextResponse.json(
      { error: "Failed to generate clarification" },
      { status: 500 }
    );
  }
}