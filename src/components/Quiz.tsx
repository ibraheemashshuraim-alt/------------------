"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import idiomsData from "@/data/idioms.json";
import { Loader2, ArrowLeft, Volume2 } from "lucide-react";

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
    setQuestions(shuffled);
  }, []);

  const speakText = (text: string) => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ur-PK";
        
        // Simple fallback if ur-PK fails on some devices, just try to speak
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("TTS Error:", e);
    }
  };

  const handleOptionSelect = async (index: number) => {
    if (selectedOption !== null || saving) return;

    setSelectedOption(index);
    const question = questions[currentIndex];
    const correct = index === question.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      speakText(question.fullAudioText);
    } else {
      speakText("غلط جواب");
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
        // BUG FIX: Score was already incremented in handleOptionSelect, so we don't add it again here.
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
        <div className="glass-card p-10 flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
          <p className="urdu-text text-lg text-slate-700">براہ کرم انتظار کریں...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 flex flex-col items-center justify-center min-h-[80vh]">
      
      {/* Header - Made non-sticky to avoid overlapping */}
      <div className="w-full flex justify-between items-center bg-white/70 backdrop-blur-md rounded-2xl px-6 py-4 mb-6 shadow-sm border border-slate-200">
        <div className="urdu-text text-xl font-bold text-slate-700">
          سوال: {currentIndex + 1} / {questions.length}
        </div>
        <div className="urdu-text text-xl font-bold text-brand-600">
          اسکور: {score}
        </div>
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col items-center bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200"
        >
          {/* Question Text */}
          <div className="text-center w-full mb-8 relative">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 urdu-text leading-loose tracking-wide">
              {currentQuestion.sentence.split('_________').map((part: string, i: number, arr: any[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block mx-2 w-20 md:w-32 border-b-2 border-slate-400"></span>
                  )}
                </span>
              ))}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((option: string, index: number) => {
              let buttonStyle = "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md border-slate-200";
              let animation = {};

              if (selectedOption === index) {
                if (isCorrect) {
                  buttonStyle = "bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/30";
                  animation = { scale: [1, 1.03, 1] };
                } else {
                  buttonStyle = "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/30";
                  animation = { x: [-8, 8, -8, 8, 0] };
                }
              } else if (selectedOption !== null && index === currentQuestion.correctIndex) {
                // Highlight the correct answer slightly if user got it wrong
                buttonStyle = "bg-green-50 text-green-700 border-green-300";
              } else if (selectedOption !== null) {
                buttonStyle = "bg-slate-50 text-slate-400 border-slate-100 opacity-60";
              }

              return (
                <motion.button
                  key={index}
                  animate={selectedOption === index ? animation : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  className={`touch-target p-4 md:p-6 rounded-2xl border-2 text-xl md:text-2xl font-bold urdu-text transition-all duration-200 flex items-center justify-center min-h-[80px] ${buttonStyle} disabled:cursor-default`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 w-full flex justify-center overflow-hidden"
            >
              <button
                onClick={handleNext}
                className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl text-xl font-bold urdu-text flex items-center gap-3 transition-all shadow-lg active:scale-95"
              >
                <span>اگلا سوال</span>
                <ArrowLeft className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
