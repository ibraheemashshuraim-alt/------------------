"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, Medal, Crown, Star } from "lucide-react";

interface ResultScreenProps {
  score: number;
  total: number;
  studentName: string;
}

export default function ResultScreen({ score, total, studentName }: ResultScreenProps) {
  useEffect(() => {
    if (score >= 20) {
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
    }
  }, [score]);

  let feedback = "";
  let giftIcon = null;
  let giftBg = "";
  let giftText = "";

  if (score === total) {
    feedback = "شاندار! آپ محاورات کے بادشاہ ہیں!";
    giftIcon = <Crown className="w-16 h-16 text-yellow-500" />;
    giftBg = "bg-yellow-100 border-yellow-300";
    giftText = "👑 سونے کا تاج";
  } else if (score >= 25) {
    feedback = "زبردست! آپ کی کارکردگی شاندار رہی۔";
    giftIcon = <Trophy className="w-16 h-16 text-yellow-500" />;
    giftBg = "bg-yellow-50 border-yellow-200";
    giftText = "🏆 گولڈ ٹرافی";
  } else if (score >= 20) {
    feedback = "بہت خوب! آپ کی کارکردگی اچھی رہی۔";
    giftIcon = <Medal className="w-16 h-16 text-slate-400" />;
    giftBg = "bg-slate-100 border-slate-300";
    giftText = "🥈 سلور میڈل";
  } else if (score >= 10) {
    feedback = "اچھی کوشش! مزید پریکٹس کریں تو آپ بہتر ہو سکتے ہیں۔";
    giftIcon = <Medal className="w-16 h-16 text-amber-700" />;
    giftBg = "bg-amber-100 border-amber-300";
    giftText = "🥉 برانز میڈل";
  } else {
    feedback = "کوشش جاری رکھیں، آپ جلد ہی سیکھ جائیں گے!";
    giftIcon = <span className="text-6xl">🎈</span>;
    giftBg = "bg-red-50 border-red-200";
    giftText = "🎈 حوصلہ افزائی کا غبارہ";
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="bg-white/95 rounded-[3rem] p-10 md:p-14 max-w-lg w-full text-center relative overflow-hidden shadow-2xl border-b-8 border-brand-200"
      >
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-brand-300/30 to-transparent -z-10" />
        
        <motion.div
          initial={{ y: -50, rotate: -10 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={`w-32 h-32 ${giftBg} border-4 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner`}
        >
          {giftIcon}
        </motion.div>
        
        <div className="text-xl font-bold urdu-text text-slate-500 mb-2">آپ کا انعام: <span className="text-brand-600">{giftText}</span></div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 urdu-text">
          شاباش {studentName}!
        </h1>
        
        <div className="my-8 bg-slate-50 rounded-3xl p-6 border-2 border-slate-100">
          <div className="text-sm text-slate-500 uppercase tracking-wider mb-2 font-bold flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Your Score
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-7xl font-black text-brand-600 mb-4 font-sans drop-shadow-md">
            {score}<span className="text-4xl text-slate-400">/{total}</span>
          </div>
          <p className="text-2xl text-slate-700 urdu-text leading-relaxed font-bold">
            {feedback}
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-brand-500 hover:bg-brand-600 text-white font-bold py-5 px-10 rounded-2xl transition-all shadow-[0_6px_0_rgb(22,163,74)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(22,163,74)] active:translate-y-2 active:shadow-none flex items-center justify-center mx-auto space-x-3 space-x-reverse touch-target w-full"
        >
          <RotateCcw className="w-6 h-6 stroke-[3px]" />
          <span className="urdu-text text-2xl">ہوم پیج پر جائیں</span>
        </button>
      </motion.div>
    </div>
  );
}
