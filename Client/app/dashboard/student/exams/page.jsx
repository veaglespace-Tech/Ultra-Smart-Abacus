"use client";

import React from "react";
import { useStudentData } from "../StudentContext";

export default function StudentExamsPage() {
  const { exams } = useStudentData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white">Academic Examination Schedule & Grades</h3>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">
            View your upcoming scheduled midterm evaluations or diagnostic test scores.
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 flex items-center gap-1.5">
          Avg. Score: 91.5%
        </div>
      </div>

      {/* Exams list table */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <th className="px-6 py-4">Assessment Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Session Time</th>
                <th className="px-6 py-4 text-center">Duration</th>
                <th className="px-6 py-4 text-center">Grade / Score</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {exams.map((exam) => {
                let statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                if (exam.status === "Scheduled") {
                  statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                } else if (exam.status === "Passed") {
                  statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                }

                return (
                  <tr key={exam.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{exam.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{exam.date}</td>
                    <td className="px-6 py-4 text-slate-400">{exam.time || "N/A"}</td>
                    <td className="px-6 py-4 text-center font-mono text-slate-400">{exam.duration}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-white text-sm font-mono">
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
