"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import idiomsData from "@/data/idioms.json";
import { Loader2, ArrowLeft, Volume2, Star } from "lucide-react";

interface QuizProps {
  student: any;
  onComplete: (score: number, total: number) => void;
}

export default function Quiz({ student, onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Shuffle and pick 10 questions
    const shuffled = [...idiomsData].sort(() => Math.random() - 0.5).slice(0, 10);
    
    // Shuffle options for each question so correct answer is not always first
    const processedQuestions = shuffled.map((q) => {
      const optionsMapped = q.options.map((opt: string, idx: number) => ({
        text: opt,
        isCorrect: idx === q.correctIndex
      }));
      // Shuffle the options array
      const shuffledOptions = optionsMapped.sort(() => Math.random() - 0.5);
      return { ...q, shuffledOptions };
    });

    setQuestions(processedQuestions);
  }, []);

  const playVoice = (text: string) => {
    try {
      // Using Google Translate TTS via HTML5 Audio (bypasses most browser TTS limitations)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ur&client=tw-ob`;
      const audio = new Audio(url);
      audio.play().catch((e) => {
        console.error("Audio playback failed, falling back to SpeechSynthesis:", e);
        // Fallback
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ur-PK";
          window.speechSynthesis.speak(utterance);
        }
      });
    } catch (e) {
      console.error("Voice Error:", e);
    }
  };

  const handleOptionSelect = async (index: number) => {
    if (selectedOption !== null || saving) return;

    setSelectedOption(index);
    const question = questions[currentIndex];
    const correct = question.shuffledOptions[index].isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      playVoice(question.fullAudioText);
    } else {
      playVoice("غلط جواب");
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setSaving(true);
      try {
        await supabase
          .from("students")
          .update({ 
            score: score, 
            has_played: true 
          })
          .eq("id", student.id);
        
        onComplete(score, questions.length);
      } catch (err) {
        console.error("Failed to save score:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  if (questions.length === 0 || saving) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="bg-white/80 rounded-3xl p-10 flex flex-col items-center border-b-8 border-brand-200">
          <Loader2 className="w-16 h-16 animate-spin text-brand-500 mb-4" />
          <p className="urdu-text text-xl text-slate-700 font-bold">براہ کرم انتظار کریں... ⏳</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 flex flex-col items-center justify-center min-h-[80vh]">
      
      {/* Header - Playful & Kid Friendly */}
      <div className="w-full flex justify-between items-center bg-white/90 rounded-3xl px-6 py-4 mb-6 shadow-sm border-b-4 border-slate-200">
        <div className="urdu-text text-xl font-bold text-indigo-600 flex items-center gap-2">
          <span>🎯 سوال:</span>
          <span className="bg-indigo-100 px-3 py-1 rounded-xl">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="urdu-text text-xl font-bold text-amber-500 flex items-center gap-2">
          <span>⭐ اسکور:</span>
          <span className="bg-amber-100 px-3 py-1 rounded-xl text-amber-600">{score}</span>
        </div>
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
          className="w-full flex flex-col items-center bg-white rounded-[2rem] p-6 md:p-10 shadow-xl border-b-8 border-slate-200"
        >
          {/* Question Text */}
          <div className="text-center w-full mb-8 relative bg-sky-50 rounded-3xl p-8 border-2 border-sky-100">
            <div className="absolute -top-6 -left-2 bg-yellow-300 rounded-full p-3 shadow-sm transform -rotate-12">
              <Volume2 className="w-8 h-8 text-yellow-800" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 urdu-text leading-loose tracking-wide">
              {currentQuestion.sentence.split('_________').map((part: string, i: number, arr: any[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block mx-2 w-20 md:w-32 border-b-4 border-slate-400 border-dotted"></span>
                  )}
                </span>
              ))}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {currentQuestion.shuffledOptions.map((option: any, index: number) => {
              let buttonStyle = "bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 border-slate-200 border-b-4";
              let animation = {};

              if (selectedOption === index) {
                if (isCorrect) {
                  buttonStyle = "bg-green-500 text-white border-green-700 border-b-0 translate-y-1 shadow-inner";
                  animation = { scale: [1, 1.05, 1] };
                } else {
                  buttonStyle = "bg-red-500 text-white border-red-700 border-b-0 translate-y-1 shadow-inner";
                  animation = { x: [-8, 8, -8, 8, 0] };
                }
              } else if (selectedOption !== null && option.isCorrect) {
                // Highlight correct answer
                buttonStyle = "bg-green-100 text-green-800 border-green-300 border-b-4 border-dashed";
              } else if (selectedOption !== null) {
                // Dim other options
                buttonStyle = "bg-slate-50 text-slate-400 border-slate-100 border-b-2 opacity-60";
              }

              return (
                <motion.button
                  key={index}
                  animate={selectedOption === index ? animation : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  className={`touch-target p-4 md:p-6 rounded-2xl border-2 text-2xl font-bold urdu-text transition-all duration-200 flex items-center justify-center min-h-[90px] ${buttonStyle} disabled:cursor-default active:border-b-0 active:translate-y-1`}
                >
                  {option.text}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 w-full flex justify-center"
            >
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-2xl font-bold urdu-text flex items-center gap-3 transition-all shadow-[0_6px_0_rgb(67,56,202)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(67,56,202)] active:translate-y-2 active:shadow-none"
              >
                <span>اگلا سوال</span>
                <ArrowLeft className="w-8 h-8" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
