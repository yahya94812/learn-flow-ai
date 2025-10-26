// app/api/generate-mindmap/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

// JSON Schema for response validation
const mindMapSchema = {
  type: "object",
  properties: {
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          data: {
            type: "object",
            properties: {
              label: { type: "string" }
            },
            required: ["label"]
          }
        },
        required: ["id", "data"]
      }
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source: { type: "string" },
          target: { type: "string" }
        },
        required: ["source", "target"]
      }
    }
  },
  required: ["nodes", "edges"]
};

export async function POST(req: NextRequest) {
  try {
    const { mainTopic } = await req.json();

    if (!mainTopic || typeof mainTopic !== 'string') {
      return NextResponse.json(
        { error: 'mainTopic is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Create detailed prompt for mind map generation
    const prompt = `Generate a comprehensive mind map for the topic: "${mainTopic}".

Requirements:
- Create a hierarchical structure with maximum depth of 4 levels (level 0 to level 3)
- Level 0: Single root node with the main topic
- Level 1: 3-5 main categories/subtopics
- Level 2: 2-4 sub-categories for each level 1 node
- Level 3: 1-3 specific details for some level 2 nodes (not all need level 3)
- Each node must have a unique ID (use format: "node_1", "node_2", etc.)
- Each node must have a concise, clear label (2-4 words max)
- Create edges that connect parent to child nodes

Return JSON with this structure:
{
  "nodes": [
    { "id": "node_1", "data": { "label": "Main Topic" } },
    { "id": "node_2", "data": { "label": "Subtopic 1" } }
  ],
  "edges": [
    { "source": "node_1", "target": "node_2" }
  ]
}

Make the mind map informative, well-organized, and educational. Return ONLY valid JSON, no additional text or markdown formatting.`;

    // Generate content with the correct API structure
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: mindMapSchema,
      },
    });

    const text = response.text;
    
    // Parse JSON response
    const mindMapData = JSON.parse(text);

    // Validate response structure
    if (!mindMapData.nodes || !Array.isArray(mindMapData.nodes)) {
      throw new Error('Invalid response: nodes array is missing');
    }
    if (!mindMapData.edges || !Array.isArray(mindMapData.edges)) {
      throw new Error('Invalid response: edges array is missing');
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: mindMapData,
      topic: mainTopic,
    });

  } catch (error: any) {
    console.error('Error generating mind map:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate mind map',
      },
      { status: 500 }
    );
  }
}

// Optional GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Mind Map Generation API',
    usage: 'POST request with { "mainTopic": "your topic" }',
    example: {
      mainTopic: 'Machine Learning'
    }
  });
}