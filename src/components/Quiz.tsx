"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import idiomsData from "@/data/idioms.json";
import { Loader2, ArrowLeft, Lightbulb, PartyPopper } from "lucide-react";

interface QuizProps {
  student: any;
  onComplete: (score: number, total: number) => void;
}

const OPTION_COLORS = [
  "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-900",
  "bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900",
  "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900",
  "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900"
];

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
      const shuffledOptions = optionsMapped.sort(() => Math.random() - 0.5);
      return { ...q, shuffledOptions };
    });

    setQuestions(processedQuestions);
  }, []);

  const playVoice = (text: string) => {
    try {
      // Using gtx client which is highly reliable for Google Translate TTS
      const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ur&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      audio.play().catch((e) => {
        console.error("Audio playback failed:", e);
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
        <div className="bg-white/90 rounded-3xl p-10 flex flex-col items-center border-b-8 border-brand-300 shadow-xl">
          <Loader2 className="w-16 h-16 animate-spin text-brand-500 mb-6" />
          <p className="urdu-text text-2xl text-slate-700 font-bold">تیار ہو جائیں! 🚀</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 flex flex-col items-center justify-center min-h-[85vh] overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center bg-white/95 rounded-full px-6 py-3 mb-6 shadow-md border border-slate-100">
        <div className="urdu-text text-xl font-bold text-slate-700 flex items-center gap-2">
          <span>📝 سوال:</span>
          <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-800">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="urdu-text text-xl font-bold text-amber-500 flex items-center gap-2">
          <span>🏆 اسکور:</span>
          <span className="bg-amber-100 px-3 py-1 rounded-full text-amber-600">{score}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          {/* Question Bubble */}
          <div className="relative w-full mb-8 bg-white rounded-[2rem] p-8 md:p-12 shadow-lg border-b-8 border-brand-100 text-center">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 rounded-full p-4 shadow-md border-4 border-white">
              <Lightbulb className="w-8 h-8 text-white fill-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 urdu-text leading-[2.2] tracking-wide mt-4">
              {currentQuestion.sentence.split('_________').map((part: string, i: number, arr: any[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block mx-3 w-24 md:w-40 border-b-4 border-slate-300 border-dashed translate-y-1 md:translate-y-2"></span>
                  )}
                </span>
              ))}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
            {currentQuestion.shuffledOptions.map((option: any, index: number) => {
              const baseColor = OPTION_COLORS[index % 4];
              let buttonStyle = `${baseColor} border-b-4 active:border-b-0 active:translate-y-1`;
              let animation = {};

              if (selectedOption === index) {
                if (isCorrect) {
                  buttonStyle = "bg-green-500 text-white border-green-600 border-b-0 translate-y-1 shadow-inner";
                  animation = { scale: [1, 1.05, 1] };
                } else {
                  buttonStyle = "bg-red-500 text-white border-red-600 border-b-0 translate-y-1 shadow-inner";
                  animation = { x: [-8, 8, -8, 8, 0] };
                }
              } else if (selectedOption !== null && option.isCorrect) {
                // Highlight correct answer playfully
                buttonStyle = "bg-green-400 text-white border-green-500 border-b-4 animate-pulse";
              } else if (selectedOption !== null) {
                // Dim other options
                buttonStyle = "bg-slate-100 text-slate-400 border-slate-200 border-b-2 opacity-50";
              }

              return (
                <motion.button
                  key={index}
                  animate={selectedOption === index ? animation : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  className={`touch-target px-4 py-6 md:py-8 rounded-3xl border-2 text-2xl md:text-3xl font-bold urdu-text transition-all duration-200 flex items-center justify-center text-center shadow-sm ${buttonStyle} disabled:cursor-default`}
                >
                  {option.text}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 mb-4 w-full flex justify-center"
            >
              <button
                onClick={handleNext}
                className="bg-brand-500 hover:bg-brand-600 text-white px-12 py-4 rounded-full text-2xl font-bold urdu-text flex items-center gap-4 transition-all shadow-[0_6px_0_rgb(22,163,74)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(22,163,74)] active:translate-y-2 active:shadow-none"
              >
                <span>اگلا سوال</span>
                <ArrowLeft className="w-8 h-8 stroke-[3px]" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
