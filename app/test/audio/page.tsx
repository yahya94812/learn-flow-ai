"use client";

import { useState, useRef } from "react";

export default function Page() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("JBFqnCBsd6RMkjVDRZzb"); // default voiceId
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setStatusText(null);

    if (!text.trim()) {
      setError("Please enter text to synthesize.");
      return;
    }

    setLoading(true);
    setAudioUrl(null);

    try {
      // request the API route
      const resp = await fetch(`/api/audio?text=${encodeURIComponent(text)}&voiceId="RaFzMbMIfqBcIurH6XF9"`, {
        method: "GET",
        // avoid cached responses while debugging
        cache: "no-store",
      });

      // if server returned JSON error, read and show it
      const contentType = resp.headers.get("content-type") || "";
      if (!resp.ok) {
        // try parse JSON error
        if (contentType.includes("application/json")) {
          const json = await resp.json();
          throw new Error(json?.error ?? JSON.stringify(json));
        } else {
          const txt = await resp.text();
          throw new Error(txt || `HTTP ${resp.status}`);
        }
      }

      // if the response is JSON unexpectedly, show it (debug)
      if (contentType.includes("application/json")) {
        const json = await resp.json();
        throw new Error(`Unexpected JSON response: ${JSON.stringify(json)}`);
      }

      // read as arrayBuffer (works better for streamed binary)
      const arr = await resp.arrayBuffer();
      if (!arr || arr.byteLength === 0) {
        throw new Error("Empty audio response");
      }

      const blob = new Blob([arr], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatusText("Audio generated successfully.");

      // try to autoplay
      setTimeout(() => {
        try {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {
              /* autoplay might be blocked — user can press play */
            });
          }
        } catch (e) {
          // ignore
        }
      }, 50);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4">Text → Speech (ElevenLabs)</h1>

      <textarea
        rows={5}
        className="w-full max-w-2xl p-3 border rounded mb-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type text to speak..."
      />


      {statusText && <p className="text-green-700 mb-2">{statusText}</p>}
      {error && <p className="text-red-700 mb-2">Error: {error}</p>}

      {audioUrl && (
        <div className="w-full max-w-2xl mt-4">
          <audio ref={audioRef} controls src={audioUrl} className="w-full" />
          <div className="mt-2 flex gap-2">
            <a className="underline" href={audioUrl} download="tts.mp3">Download MP3</a>
            <button
              onClick={() => {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
                setStatusText("Cleared audio URL");
              }}
              className="px-3 py-1 rounded border"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl mt-6 text-sm text-gray-600">
        <p><strong>Debug tips:</strong> If you still get no audio, open DevTools → Network and inspect the `/api/audio` response (status, body, headers).</p>
      </div>
    </main>
  );
}
