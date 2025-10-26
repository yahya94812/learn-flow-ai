import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});


export async function POST(req: Request) {
  const { text } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(text);

  return NextResponse.json({ reply: result.response.text() });
}


export async function GET() {
  try {
    if (!apiKey) {
      return new Response("Missing GEMINI_API_KEY on server", { status: 500 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",


      contents: `AI is basically making machines behave like humans in some way thinking reasoning solving learning The term was first used by John McCarthy in 1956 Dartmouth Conference 
      Wait before that AI can be divided into two Narrow AI specific tasks like speech recognition and General AI humanlevel intelligence still theoretical

I remember something about agents in AI yes an intelligent agent is any system that perceives its environment and acts to achieve goals Like a vacuum cleaner robot or a chess program The agent interacts with an environment takes actions and gets feedback

Theres a lot about search too Problems are often solved by exploring a space of possible solutions
Uninformed search doesnt use any knowledge e g BFS DFS
Informed search uses heuristics A Star Greedy
Actually the A Star algorithm combines the cost to reach a node and the estimated cost to reach the goal f n gn hn

Hold on learning also comes up a lot machine learning is considered a subset of AI Its where systems improve automatically through experience Types
1 Supervised learning trained with labeled data
2 Unsupervised no labels just patterns like clustering
3 Reinforcement learning trial and error using rewards and penalties

Somewhere I read that AI also involves knowledge representation storing facts and relationships so machines can reason Approaches logic predicate logic propositional logic semantic networks frames etc Logic is the most mathematical All humans are mortal Socrates is human Socrates is mortal`,



      config: {
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
                description: "A short subtopic name or phrase under 10 words.",
              },
              minItems: 3,
              maxItems: 10,
            },
          },
          required: ["subtopics"],
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
