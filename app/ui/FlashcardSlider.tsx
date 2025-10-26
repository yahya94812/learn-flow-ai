import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FlashcardSlider = ({ titles = [], explanations = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  // Default data if no props provided
  const defaultTitles = [
    "React Hooks",
    "Virtual DOM",
    "Component Lifecycle",
    "State Management",
    "Props vs State"
  ];

  const defaultExplanations = [
    "React Hooks are **functions** that let you use state and other React features in functional components.\n\nCommon hooks include:\n- `useState`\n- `useEffect`\n- `useContext`",
    "The Virtual DOM is a *lightweight copy* of the actual DOM. React uses it to optimize updates by calculating the minimal changes needed before updating the real DOM.",
    "Component lifecycle refers to the phases a component goes through:\n1. **Mounting**\n2. **Updating**\n3. **Unmounting**\n\nEach phase has specific methods or hooks for executing code.",
    "State management is how you handle data flow in your application.\n\n**Options include:**\n- Local state\n- Context API\n- Redux\n- Zustand",
    "**Props** are read-only data passed from parent to child components.\n\n**State** is mutable data managed within a component that triggers re-renders when changed."
  ];

  const finalTitles = titles.length > 0 ? titles : defaultTitles;
  const finalExplanations = explanations.length > 0 ? explanations : defaultExplanations;

  // Color palette for cards
  const colors = [
    'bg-gradient-to-br from-blue-100 to-blue-200',
    'bg-gradient-to-br from-purple-100 to-purple-200',
    'bg-gradient-to-br from-pink-100 to-pink-200',
    'bg-gradient-to-br from-green-100 to-green-200',
    'bg-gradient-to-br from-yellow-100 to-yellow-200',
    'bg-gradient-to-br from-orange-100 to-orange-200',
    'bg-gradient-to-br from-teal-100 to-teal-200',
    'bg-gradient-to-br from-indigo-100 to-indigo-200'
  ];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? finalTitles.length - 1 : prev - 1));
    setAudioError(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === finalTitles.length - 1 ? 0 : prev + 1));
    setAudioError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  const handleAudioPlay = async () => {
    setAudioError(null);
    
    // Create text from current card
    const textToSpeak = `${finalTitles[currentIndex]}. ${finalExplanations[currentIndex]}`;
    
    setAudioLoading(true);
    
    try {
      const resp = await fetch(
        `/api/audio?text=${encodeURIComponent(textToSpeak)}&voiceId=RaFzMbMIfqBcIurH6XF9`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const contentType = resp.headers.get('content-type') || '';
      
      if (!resp.ok) {
        if (contentType.includes('application/json')) {
          const json = await resp.json();
          throw new Error(json?.error ?? JSON.stringify(json));
        } else {
          const txt = await resp.text();
          throw new Error(txt || `HTTP ${resp.status}`);
        }
      }

      if (contentType.includes('application/json')) {
        const json = await resp.json();
        throw new Error(`Unexpected JSON response: ${JSON.stringify(json)}`);
      }

      const arr = await resp.arrayBuffer();
      if (!arr || arr.byteLength === 0) {
        throw new Error('Empty audio response');
      }

      // Clear previous audio URL if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const blob = new Blob([arr], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Autoplay
      setTimeout(() => {
        try {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {
              // Autoplay might be blocked
            });
          }
        } catch (e) {
          // ignore
        }
      }, 50);
    } catch (err) {
      setAudioError(err?.message || String(err));
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div 
      className="w-full flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full max-w-7xl">
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="flex-shrink-0 p-2 lg:p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 group-hover:text-blue-600" />
          </button>

          {/* Flashcard Container */}
          <div className="flex-1 min-h-[500px] lg:min-h-[600px]">
            <div
              className={`w-full h-full ${colors[currentIndex % colors.length]} rounded-2xl lg:rounded-3xl shadow-2xl flex flex-col p-8 sm:p-12 lg:p-16 relative`}
            >
              {/* Title at top */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 break-words">
                  {finalTitles[currentIndex]}
                </h1>
              </div>

              {/* Explanation in center with markdown support */}
              <div className="flex-1 flex items-center justify-center overflow-auto">
                <div className="text-center w-full max-w-4xl prose prose-lg prose-gray">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-4" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-800 text-white px-2 py-1 rounded text-base sm:text-lg lg:text-xl" {...props} />,
                      ul: ({node, ...props}) => <ul className="text-lg sm:text-xl lg:text-2xl text-left list-disc list-inside space-y-2 text-gray-700" {...props} />,
                      ol: ({node, ...props}) => <ol className="text-lg sm:text-xl lg:text-2xl text-left list-decimal list-inside space-y-2 text-gray-700" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2" {...props} />,
                    }}
                  >
                    {finalExplanations[currentIndex]}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Page counter at bottom */}
              <div className="text-center mt-6 lg:mt-4">
                <span className="text-gray-500 text-base lg:text-lg font-medium">
                  {currentIndex + 1} / {finalTitles.length}
                </span>
              </div>

              {/* Audio button at bottom right */}
              <button
                onClick={handleAudioPlay}
                disabled={audioLoading}
                className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 p-3 lg:p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Play audio"
              >
                {audioLoading ? (
                  <div className="w-6 h-6 lg:w-8 lg:h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <Volume2 className="w-6 h-6 lg:w-8 lg:h-8 text-gray-700 group-hover:text-blue-600" />
                )}
              </button>

              {/* Hidden audio element */}
              {audioUrl && (
                <audio ref={audioRef} src={audioUrl} className="hidden" />
              )}

              {/* Error message */}
              {audioError && (
                <div className="absolute bottom-20 lg:bottom-24 right-6 lg:right-8 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg max-w-xs">
                  <p className="text-sm">{audioError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="flex-shrink-0 p-2 lg:p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group"
            aria-label="Next card"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 group-hover:text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardSlider;