"use client";

import { useState } from "react";
import EntryScreen from "./EntryScreen";
import Quiz from "./Quiz";
import ResultScreen from "./ResultScreen";
import { motion, AnimatePresence } from "framer-motion";

export default function GameContainer() {
  const [step, setStep] = useState<"entry" | "quiz" | "result">("entry");
  const [student, setStudent] = useState<any>(null);
  const [scoreData, setScoreData] = useState({ score: 0, total: 0 });

  const handleStart = (studentData: any) => {
    setStudent(studentData);
    setStep("quiz");
  };

  const handleComplete = (score: number, total: number) => {
    setScoreData({ score, total });
    setStep("result");
  };

  return (
    <main className="container mx-auto max-w-6xl py-8 px-4">
      <AnimatePresence mode="wait">
        {step === "entry" && (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EntryScreen onStart={handleStart} />
          </motion.div>
        )}
        
        {step === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Quiz student={student} onComplete={handleComplete} />
          </motion.div>
        )}
        
        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <ResultScreen score={scoreData.score} total={scoreData.total} studentName={student?.name} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
