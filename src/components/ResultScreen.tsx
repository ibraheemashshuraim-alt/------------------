"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";

interface ResultScreenProps {
  score: number;
  total: number;
  studentName: string;
}

export default function ResultScreen({ score, total, studentName }: ResultScreenProps) {
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const percentage = Math.round((score / total) * 100);
  let feedback = "";
  if (percentage >= 80) feedback = "شاندار! آپ محاورات کے ماہر ہیں۔";
  else if (percentage >= 50) feedback = "بہت خوب! مزید مشق سے آپ بہتر ہو سکتے ہیں۔";
  else feedback = "کوشش جاری رکھیں، آپ سیکھ جائیں گے!";

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="glass-card p-10 max-w-lg w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-500/20 to-transparent -z-10" />
        
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
        >
          <Trophy className="w-12 h-12 text-brand-600" />
        </motion.div>

        <h1 className="text-4xl font-bold text-slate-800 mb-2 urdu-text">
          شاباش {studentName}!
        </h1>
        
        <div className="my-8">
          <div className="text-sm text-slate-500 uppercase tracking-wider mb-2 font-bold">Your Score</div>
          <div className="text-7xl font-black text-brand-600 mb-4 font-sans">
            {score}<span className="text-4xl text-slate-400">/{total}</span>
          </div>
          <p className="text-2xl text-slate-700 urdu-text leading-relaxed">
            {feedback}
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center mx-auto space-x-3 space-x-reverse touch-target"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="urdu-text text-xl">ہوم پیج پر جائیں</span>
        </button>
      </motion.div>
    </div>
  );
}
