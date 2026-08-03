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
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    const shuffled = [...idiomsData].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);

    // Preload voices
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      setVoicesLoaded(true);
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      // Fallback to Hindi or Arabic if Urdu is not installed, as Hindi sounds identical for basic phrases
      const preferredVoice = voices.find(v => v.lang.includes('ur')) 
                          || voices.find(v => v.lang.includes('hi'))
                          || voices.find(v => v.lang.includes('ar'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        utterance.lang = "ur-PK";
      }

      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
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
        await supabase
          .from("students")
          .update({ 
            score: score + (isCorrect ? 1 : 0), 
            has_played: true 
          })
          .eq("id", student.id);
        
        onComplete(score + (isCorrect ? 1 : 0), questions.length);
      } catch (err) {
        console.error("Failed to save score:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  if (questions.length === 0 || saving) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="glass-card p-12 flex flex-col items-center">
          <Loader2 className="w-16 h-16 animate-spin text-brand-500 mb-4" />
          <p className="urdu-text text-xl text-slate-700">براہ کرم انتظار کریں...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col min-h-[85vh]">
      {/* Header */}
      <div className="flex justify-between items-center glass-card px-8 py-5 mb-8 sticky top-4 z-10 border-b-4 border-brand-500">
        <div className="urdu-text text-2xl font-bold text-slate-700 flex items-center gap-3">
          <span className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">سوال: {currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="urdu-text text-2xl font-bold flex items-center gap-3">
          <span className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl border border-brand-200">اسکور: {score}</span>
        </div>
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="flex-grow flex flex-col justify-center w-full"
        >
          <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-10 md:p-16 mb-10 text-center shadow-2xl shadow-brand-900/20 border border-brand-400/30">
            <div className="absolute top-4 left-4 opacity-20">
              <Volume2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white urdu-text leading-[2.5] tracking-wide drop-shadow-lg">
              {currentQuestion.sentence.split('_________').map((part: string, i: number, arr: any[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block mx-4 w-32 md:w-48 border-b-4 border-dashed border-white/70"></span>
                  )}
                </span>
              ))}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
            {currentQuestion.options.map((option: string, index: number) => {
              let buttonStyle = "bg-white text-slate-800 hover:bg-brand-50 hover:border-brand-300 hover:shadow-md border-slate-200";
              let animation = {};

              if (selectedOption === index) {
                if (isCorrect) {
                  buttonStyle = "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-xl shadow-green-500/30 scale-[1.02]";
                  animation = { scale: [1, 1.05, 1] };
                } else {
                  buttonStyle = "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-xl shadow-red-500/30";
                  animation = { x: [-10, 10, -10, 10, 0] };
                }
              } else if (selectedOption !== null && index === currentQuestion.correctIndex) {
                buttonStyle = "bg-green-50 text-green-800 border-green-400 border-dashed opacity-80";
              } else if (selectedOption !== null) {
                buttonStyle = "bg-slate-50 text-slate-400 border-slate-200 opacity-50";
              }

              return (
                <motion.button
                  key={index}
                  animate={selectedOption === index ? animation : {}}
                  transition={{ duration: 0.4 }}
                  onClick={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  className={`touch-target px-8 py-8 rounded-2xl border-2 text-3xl font-bold urdu-text transition-all duration-300 ${buttonStyle} disabled:cursor-default flex items-center justify-center min-h-[120px]`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex justify-center w-full"
            >
              <button
                onClick={handleNext}
                className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-5 rounded-2xl text-2xl font-bold urdu-text flex items-center gap-4 transition-all shadow-xl hover:shadow-2xl active:scale-95"
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
