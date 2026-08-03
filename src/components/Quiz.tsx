"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import idiomsData from "@/data/idioms.json";
import { Loader2 } from "lucide-react";

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
    // Optionally shuffle questions or pick a subset. Here we take all or just shuffle them.
    const shuffled = [...idiomsData].sort(() => Math.random() - 0.5).slice(0, 10); // Let's do 10 questions for the game
    setQuestions(shuffled);
  }, []);

  const speakText = (text: string, onEnd?: () => void) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ur-PK";
      if (onEnd) {
        utterance.onend = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      if (onEnd) onEnd();
    }
  };

  const handleOptionSelect = async (index: number) => {
    if (selectedOption !== null || saving) return; // Prevent multiple clicks

    setSelectedOption(index);
    const question = questions[currentIndex];
    const correct = index === question.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      speakText(question.fullAudioText, () => {
        setTimeout(() => handleNext(), 500);
      });
    } else {
      speakText("غلط جواب!", () => {
        setTimeout(() => handleNext(), 1500);
      });
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Quiz finished
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
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col min-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm mb-8 sticky top-4 z-10 border border-slate-200/50">
        <div className="urdu-text text-xl font-bold text-slate-800">
          سوال: {currentIndex + 1} / {questions.length}
        </div>
        <div className="urdu-text text-xl font-bold text-brand-600">
          اسکور: {score}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="flex-grow flex flex-col justify-center"
        >
          <div className="glass-card p-8 mb-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 urdu-text leading-loose">
              {currentQuestion.sentence}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentQuestion.options.map((option: string, index: number) => {
              let buttonStyle = "bg-white text-slate-700 hover:bg-slate-50 border-slate-200";
              let animation = {};

              if (selectedOption === index) {
                if (isCorrect) {
                  buttonStyle = "bg-green-500 text-white border-green-600 shadow-green-500/50";
                  animation = { scale: [1, 1.05, 1] };
                } else {
                  buttonStyle = "bg-red-500 text-white border-red-600 shadow-red-500/50";
                  animation = { x: [-10, 10, -10, 10, 0] }; // Shake effect
                }
              } else if (selectedOption !== null && index === currentQuestion.correctIndex) {
                // Show correct option if user chose wrongly
                buttonStyle = "bg-green-100 text-green-800 border-green-300";
              }

              return (
                <motion.button
                  key={index}
                  animate={selectedOption === index ? animation : {}}
                  transition={{ duration: 0.4 }}
                  onClick={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  className={`touch-target p-6 rounded-2xl border-2 text-2xl font-bold urdu-text transition-all duration-300 shadow-sm ${buttonStyle} disabled:cursor-not-allowed`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
