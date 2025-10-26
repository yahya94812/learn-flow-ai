export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing ELEVENLABS_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const text = url.searchParams.get("text") ?? `nothing to say`;
  const voiceId = url.searchParams.get("voiceId") ?? "JBFqnCBsd6RMkjVDRZzb";

  const elevenlabs = new ElevenLabsClient({ apiKey });

  try {
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    // audio may be a Blob or a ReadableStream<Uint8Array>
    const body = typeof (audio as any).stream === "function"
      ? (audio as Blob).stream()
      : (audio as ReadableStream<Uint8Array>);

    return new Response(body as any, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "TTS conversion failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}