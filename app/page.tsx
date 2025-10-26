"use client"
import { useState } from 'react';
import { Upload, FileText, Sparkles, X, Send, Brain, Target, Trophy, MessageCircle, BarChart3, BookOpen, Zap, PlayCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function LearnFlowHome() {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type === 'text/plain' || file.name.endsWith('.txt')
    );
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'text/plain' || file.name.endsWith('.txt')
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      alert('Please upload at least one .txt file');
      return;
    }

    const fileContents = await Promise.all(
      files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({
            name: file.name,
            content: e.target.result
          });
          reader.onerror = reject;
          reader.readAsText(file);
        });
      })
    );

    const combinedText = fileContents
      .map(f => `=== ${f.name} ===\n${f.content}`)
      .join('\n\n');

    console.log('Combined Text:', combinedText);
    console.log('Prompt:', prompt);
    
    alert('Files processed! Check console for output. Replace this with your component logic.');
  };

  const features = [
    {
      icon: Brain,
      title: "Smart Study Plans",
      description: "AI analyzes your materials and creates personalized learning paths from basics to advanced"
    },
    {
      icon: Sparkles,
      title: "Interactive Flashcards",
      description: "Colorful, animated cards with audio narration and visuals for engaging learning"
    },
    {
      icon: Target,
      title: "Micro-Exercises",
      description: "Quick quizzes after every 3 topics to reinforce learning and track progress"
    },
    {
      icon: MessageCircle,
      title: "AI Tutor Bot",
      description: "24/7 support to answer doubts, explain concepts, and provide personalized guidance"
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Detailed analytics identify weak areas and generate customized revision plans"
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn badges, rewards, and milestones to stay motivated throughout your journey"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Upload Materials",
      description: "Add your study materials or enter topics manually"
    },
    {
      number: "2",
      title: "AI Analysis",
      description: "AI extracts key concepts and creates structured learning path"
    },
    {
      number: "3",
      title: "Learn & Practice",
      description: "Study with flashcards, take quizzes, and chat with AI tutor"
    },
    {
      number: "4",
      title: "Track Progress",
      description: "Get insights, identify weak areas, and improve continuously"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LearnFlow.ai</h1>
              <p className="text-xs text-gray-500">Adaptive Learning Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Your Smart Learning Companion
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Transform Study Materials Into Interactive Learning
            </h2>
            <p className="text-lg text-gray-600">
              Upload any study material and let AI create personalized flashcards, quizzes, and learning paths tailored to your pace with instant tutor support
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Get Started</h3>
            </div>

            <div className="space-y-5">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Study Materials
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                  }`}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-7 h-7 text-gray-600" />
                  </div>
                  <p className="text-base font-medium text-gray-900 mb-1">
                    Drop your files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for .txt files • Multiple files allowed
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Uploaded Files ({files.length})
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-200 group hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Add specific topics you want to focus on, your learning goals, or any special requirements..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all text-sm"
                  rows="3"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={files.length === 0}
                className={`w-full py-3 rounded-lg font-semibold text-white text-base flex items-center justify-center gap-2 transition-all ${
                  files.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Send className="w-4 h-4" />
                Generate Learning Path
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              How LearnFlow Works
            </h3>
            <p className="text-base text-gray-600">
              Simple steps to transform your learning experience
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  {step.number}
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1.5">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Powerful Features for Better Learning
            </h3>
            <p className="text-base text-gray-600">
              Everything you need to master any subject effectively
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-5 border border-gray-200 hover:border-emerald-300 transition-all"
              >
                <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1.5">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Flow Highlight */}
      <section className="bg-emerald-600 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-5">
                Your Complete Learning Journey
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Structured Study Plans</p>
                    <p className="text-emerald-100 text-sm">AI reorganizes topics from fundamentals to advanced concepts</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Regular Assessments</p>
                    <p className="text-emerald-100 text-sm">Micro-exercises after every 3 topics plus comprehensive quizzes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Personalized Revision</p>
                    <p className="text-emerald-100 text-sm">AI identifies weak areas and creates targeted practice plans</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Always-On Support</p>
                    <p className="text-emerald-100 text-sm">Chat with AI tutor anytime for explanations and guidance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{width: '75%'}} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">75%</span>
                  </div>
                  <p className="text-sm text-gray-600">Chapter 3: Advanced Concepts</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">5 Badges Earned</p>
                      <p className="text-xs text-gray-600">Keep up the great work!</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Quiz Score: 92%</p>
                      <p className="text-xs text-gray-600">Excellent performance!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">LearnFlow.ai</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Adaptive Learning That Flows Naturally</p>
          <p className="text-xs text-gray-500">
            © 2025 LearnFlow AI. Making learning interactive and personalized.
          </p>
        </div>
      </footer>
    </div>
  );
}