"use client";

import React from "react";
import { useStudentData } from "../StudentContext";

export default function StudentExamsPage() {
  const { exams } = useStudentData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Academic Examination Schedule & Grades</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            View your upcoming scheduled midterm evaluations or diagnostic test scores.
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
          Avg. Score: 91.5%
        </div>
      </div>

      {/* Exams list table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <th className="px-6 py-4">Assessment Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Session Time</th>
                <th className="px-6 py-4 text-center">Duration</th>
                <th className="px-6 py-4 text-center">Grade / Score</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {exams.map((exam) => {
                let statusColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-455 dark:border-rose-500/20";
                if (exam.status === "Scheduled") {
                  statusColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-455 dark:border-amber-500/20";
                } else if (exam.status === "Passed") {
                  statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-455 dark:border-emerald-500/20";
                }
 
                return (
                  <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">{exam.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{exam.date}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{exam.time || "N/A"}</td>
                    <td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-400">{exam.duration}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                      {exam.score || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
