"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, Lock } from "lucide-react";

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === process.env.NEXT_PUBLIC_ADMIN_PASSCODE || passcode === "admin123") {
      setIsAuthenticated(true);
      fetchStudents();
    } else {
      setError("غلط پاس ورڈ");
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("score", { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      setError("ڈیٹا لانے میں مسئلہ ہے۔");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAccess = async (id: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ has_played: false, score: 0, gift: null })
        .eq("id", id);
      
      if (error) throw error;
      fetchStudents(); // Refresh data
    } catch (err) {
      console.error(err);
      alert("رسائی دوبارہ ترتیب دینے میں ناکام۔");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="glass-card p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 urdu-text">ایڈمن ڈیش بورڈ</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none text-center ltr touch-target"
              placeholder="Enter Passcode"
            />
            {error && <p className="text-red-500 text-sm urdu-text">{error}</p>}
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all touch-target urdu-text text-lg"
            >
              لاگ ان کریں
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 urdu-text">ایڈمن ڈیش بورڈ 👑</h1>
        <button 
          onClick={fetchStudents}
          className="p-3 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="urdu-text font-bold text-slate-700 hidden sm:block">ری فریش</span>
          <RefreshCw className={`w-5 h-5 text-slate-700 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-slate-700 font-bold urdu-text">پوزیشن</th>
                <th className="px-6 py-4 text-slate-700 font-bold urdu-text">نام</th>
                <th className="px-6 py-4 text-slate-700 font-bold urdu-text">ای میل</th>
                <th className="px-6 py-4 text-slate-700 font-bold urdu-text">اسکور</th>
                <th className="px-6 py-4 text-slate-700 font-bold urdu-text">گفٹ</th>
                <th className="px-6 py-4 text-slate-700 font-bold urdu-text text-left">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 urdu-text text-lg">
                    کوئی طالب علم موجود نہیں
                  </td>
                </tr>
              ) : (
                students.map((student, index) => {
                  let rankDisplay = (index + 1).toString();
                  let rankClass = "text-slate-600 font-bold";
                  if (index === 0 && student.score > 0) {
                    rankDisplay = "🥇 1st";
                    rankClass = "text-yellow-600 font-black text-lg bg-yellow-50 px-2 py-1 rounded-lg";
                  } else if (index === 1 && student.score > 0) {
                    rankDisplay = "🥈 2nd";
                    rankClass = "text-slate-500 font-bold text-lg bg-slate-50 px-2 py-1 rounded-lg";
                  } else if (index === 2 && student.score > 0) {
                    rankDisplay = "🥉 3rd";
                    rankClass = "text-amber-700 font-bold text-lg bg-amber-50 px-2 py-1 rounded-lg";
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4" dir="ltr"><span className={rankClass}>{rankDisplay}</span></td>
                      <td className="px-6 py-4 font-bold text-slate-800 urdu-text text-lg">{student.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-sans text-sm" dir="ltr">{student.email || student.roll_no}</td>
                      <td className="px-6 py-4 font-black text-brand-600 font-sans text-xl">{student.score || 0}</td>
                      <td className="px-6 py-4 text-2xl">{student.gift || '-'}</td>
                      <td className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleResetAccess(student.id)}
                          disabled={!student.has_played}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors urdu-text disabled:opacity-50 disabled:cursor-not-allowed touch-target font-bold border border-red-200"
                        >
                          ری سیٹ کریں
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
