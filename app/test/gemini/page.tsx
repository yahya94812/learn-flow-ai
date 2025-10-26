"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // ...existing code...
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAI() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/test/gemini/api");
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        console.log("Received data:", data);
        setAnswer(
          data.text ?? data.structuredData ?? JSON.stringify(data) ?? ""
        );
      } catch (e: any) {
        console.error("Error fetching AI:", e);
        setError(e?.message || "Failed to fetch AI answer");
      } finally {
        setLoading(false);
      }
    }
    fetchAI();
  }, []);
  // ...existing code...
  return (
    <div className="space-y-4">
      <h1>Gemini Response:</h1>
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading...</span>
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <p>{answer}</p>
      )}
    </div>
  );
}
