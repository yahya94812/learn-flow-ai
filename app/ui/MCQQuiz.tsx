"use client";

import { useState, useEffect, Suspense } from "react";

interface Question {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface QuizState {
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  showHint: boolean;
}

interface MCQQuizProps {
  topic: string;
}

export default function MCQQuiz({ topic }: MCQQuizProps) {
  const numQuestions = 10; // Fixed at 10 questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizStates, setQuizStates] = useState<QuizState[]>([]);
  const [score, setScore] = useState(0);

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setQuizStates([]);
    setCurrentIndex(0);
    setScore(0);

    try {
      const response = await fetch('/api/mcq', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setQuizStates(
          data.questions.map(() => ({
            selectedAnswer: null,
            isCorrect: null,
            showHint: false,
          }))
        );
      } else {
        setError("No questions generated");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate questions when topic changes
  useEffect(() => {
    if (topic) {
      generateQuestions();
    }
  }, [topic]);

  const handleAnswerSelect = (option: string) => {
    if (quizStates[currentIndex].isCorrect !== null) return; // Already answered

    const isCorrect = option === questions[currentIndex].answer;
    const newStates = [...quizStates];
    newStates[currentIndex] = {
      selectedAnswer: option,
      isCorrect,
      showHint: !isCorrect,
    };
    setQuizStates(newStates);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const resetQuiz = () => {
    generateQuestions();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">
            Generating 10 Questions on "{topic}"...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={generateQuestions}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null; // Loading state will show instead
  }

  const currentQuestion = questions[currentIndex];
  const currentState = quizStates[currentIndex];
  const isQuizComplete = quizStates.every((state) => state.isCorrect !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Quiz: {topic}</h2>
                <p className="text-white/80 text-sm mt-1">10 Questions</p>
              </div>
              <button
                onClick={resetQuiz}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                Restart Quiz
              </button>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>
                Score: {score} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-3">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              {currentQuestion.difficulty && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                    currentQuestion.difficulty
                  )}`}
                >
                  {currentQuestion.difficulty.toUpperCase()}
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentState.selectedAnswer === option;
                const isCorrectAnswer = option === currentQuestion.answer;
                const showResult = currentState.isCorrect !== null;

                let buttonClass = "w-full text-left px-5 py-4 rounded-lg border-2 transition-all ";
                if (!showResult) {
                  buttonClass += isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
                } else {
                  if (isCorrectAnswer) {
                    buttonClass += "border-green-500 bg-green-50";
                  } else if (isSelected) {
                    buttonClass += "border-red-500 bg-red-50";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{option}</span>
                      {showResult && isCorrectAnswer && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <span className="text-red-600 font-bold">✗</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {currentState.isCorrect === true && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                <p className="text-green-800 font-semibold">
                  🎉 Correct! Well done!
                </p>
              </div>
            )}

            {currentState.isCorrect === false && currentState.showHint && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                <p className="text-yellow-800 font-semibold mb-2">
                  💡 Hint:
                </p>
                <p className="text-yellow-700">
                  {currentQuestion.hint || "Try again! Think about the key concepts."}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {isQuizComplete && currentIndex === questions.length - 1 ? (
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-600">
                    Quiz Complete! 🎊
                  </p>
                  <p className="text-gray-600">
                    Final Score: {score} / {questions.length} (
                    {Math.round((score / questions.length) * 100)}%)
                  </p>
                </div>
              ) : (
                <button
                  onClick={goToNext}
                  disabled={currentIndex === questions.length - 1}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}