"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface EntryScreenProps {
  onStart: (student: any) => void;
}

export default function EntryScreen({ onStart }: EntryScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("براہ کرم اپنا نام اور ای میل ایڈریس درج کریں۔");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch the most recent record for this email
      const { data: existingStudent, error: fetchError } = await supabase
        .from("students")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingStudent) {
        if (existingStudent.has_played) {
          setBlocked(true);
        } else {
          // Update name just in case and proceed
          const { data, error: updateError } = await supabase
            .from("students")
            .update({ name })
            .eq("id", existingStudent.id)
            .select()
            .single();
            
          if (updateError) throw updateError;
          onStart(data);
        }
      } else {
        // Create new student
        const { data, error: insertError } = await supabase
          .from("students")
          .insert([{ name, email: email.trim().toLowerCase() }])
          .select()
          .single();

        if (insertError) throw insertError;
        onStart(data);
      }
    } catch (err: any) {
      console.error("Supabase Error:", err);
      // Display the actual error message for debugging
      setError(err?.message ? `مسئلہ پیش آیا: ${err.message}` : "کوئی مسئلہ پیش آیا ہے۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-4xl">
            🛑
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4 urdu-text">پابندی</h2>
          <p className="text-xl text-red-600 urdu-text">
            آپ پہلے ہی یہ گیم کھیل چکے ہیں۔ دوبارہ کھیلنے کی اجازت نہیں ہے۔
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-600 mb-2 urdu-text leading-relaxed">
            محاورات کی دنیا
          </h1>
          <p className="text-slate-600 urdu-text text-lg">
            اردو محاورات کا دلچسپ کھیل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 mb-2 urdu-text text-lg">طالب علم کا نام</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all urdu-text text-lg bg-white/50 touch-target"
              placeholder="اپنا نام لکھیں"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-2 urdu-text text-lg">ای میل ایڈریس</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-lg bg-white/50 touch-target font-sans"
              placeholder="example@student.com"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-center urdu-text">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center touch-target"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className="urdu-text text-2xl">کھیل شروع کریں</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
