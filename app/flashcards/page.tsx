"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import FlashcardSlider from "@/app/ui/FlashcardSlider";
import { ArrowLeft, Sparkles } from "lucide-react";

function FlashcardsContent() {
  const searchParams = useSearchParams();

  const mainTopic = searchParams.get("mainTopic");
  const subtopicsParam = searchParams.get("subtopics");
  const explanationsParam = searchParams.get("explanations");

  if (!subtopicsParam || !explanationsParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No flashcard data found
          </h2>
          <p className="text-gray-600 mb-6">
            Please generate flashcards first by uploading study materials.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const subtopics = JSON.parse(subtopicsParam);
  const explanations = JSON.parse(explanationsParam);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-900">
                  LearnFlow.ai
                </div>
                <div className="text-xs text-gray-500">Flashcard Mode</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Topic Header */}
        {mainTopic && (
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              {mainTopic}
            </h1>
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>
                {subtopics.length} subtopic{subtopics.length !== 1 ? "s" : ""}{" "}
                to master
              </span>
            </div>
          </div>
        )}

        {/* Flashcard Slider */}
        <div className="w-full">
          <FlashcardSlider
            titles={subtopics}
            explanations={explanations}
          />
        </div>
      </main>
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading flashcards...</p>
          </div>
        </div>
      }
    >
      <FlashcardsContent />
    </Suspense>
  );
}