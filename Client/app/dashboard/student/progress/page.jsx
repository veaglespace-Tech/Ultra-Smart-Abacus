"use client";

import React from "react";
import { useStudentData } from "../StudentContext";

export default function StudentProgressPage() {
  const { profile } = useStudentData();

  // Create an array representing classes. Done items are marked true.
  const classesArray = Array.from({ length: profile.totalClasses }, (_, i) => i < profile.classesAttended);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white">Student Progress & Learning Metrics</h3>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">
            Monitor speed arithmetic performance and track class sessions completed.
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300">
          Level Completion: {profile.progress}%
        </div>
      </div>

      {/* Learning stats bar visualization */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Weekly Practice Performance Metrics
        </h4>
        <div className="space-y-4">
          {[
            { metric: "Bead Movement Accuracy", pct: "92%", color: "from-blue-500 to-indigo-600" },
            { metric: "Oral Sum Speed (Single Digits)", pct: "85%", color: "from-emerald-500 to-teal-600" },
            { metric: "Visual Sum Speed (Double Digits)", pct: "64%", color: "from-amber-500 to-orange-600" },
            { metric: "Workbook Completion Pace", pct: "78%", color: "from-pink-500 to-rose-600" }
          ].map((bar, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="w-52 text-xs font-medium text-slate-300">{bar.metric}</span>
              <div className="flex-1 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  style={{ width: bar.pct }}
                  className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-1000`}
                />
              </div>
              <span className="w-12 text-right text-xs font-mono font-bold text-white mt-1 sm:mt-0">{bar.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Class Attendance Visual Grid */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Class Attendance Sheet
            </h4>
            <p className="text-[10px] text-slate-500 font-light mt-0.5">
              Completed {profile.classesAttended} out of {profile.totalClasses} total lessons in Level {profile.level}.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
            Ratio: {((profile.classesAttended / profile.totalClasses) * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {classesArray.map((attended, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                attended 
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : "bg-slate-950/40 border-white/5 text-slate-500"
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Class {i + 1}</span>
              {attended ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center border border-white/5">
                  <span className="text-[8px] font-bold">●</span>
                </div>
              )}
              <span className="text-[9px] font-semibold">
                {attended ? "Attended" : "Scheduled"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
