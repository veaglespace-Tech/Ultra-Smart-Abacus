// src/app/dashboard/teacher/exams/page.jsx
"use client";
import React, { useState } from 'react';

function LocalTable({ headers, children }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm shadow-[#4a5d4e]/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-widest text-[#7a8475]">
              {headers.map((header, idx) => <th key={idx} className="py-4 px-6">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2dcd0]/50 text-xs text-[#2c3539] font-medium">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState([
    { id: 'EX-501', batch: 'Batch Alpha', student: 'Abhishek Kulkarni', curriculum: 'Level 1 Core', status: 'Pending Review', date: '2026-06-20' },
    { id: 'EX-502', batch: 'Batch Alpha', student: 'Pranjal Patil', curriculum: 'Level 1 Core', status: 'Evaluated', date: '2026-06-20' },
    { id: 'EX-503', batch: 'Batch Beta', student: 'Siddharth Joshi', curriculum: 'Level 3 Advanced', status: 'Pending Review', date: '2026-06-24' },
    { id: 'EX-504', batch: 'Batch Beta', student: 'Rohan Deshmukh', curriculum: 'Level 3 Advanced', status: 'Evaluated', date: '2026-06-24' }
  ]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black text-[#1a202c] tracking-tight uppercase">Exam Evaluation Hub</h2>
          <p className="text-[11px] text-[#8a9485] font-medium mt-0.5">Track student progress tracking via active level testing schedules.</p>
        </div>
      </div>

      {/* EXAMS CLASSIFICATION TABLE */}
      <LocalTable headers={["Status", "Student & Curriculum Node", "Target Batch", "Log Date"]}>
        {exams.map((exam) => (
          <tr key={exam.id} className="hover:bg-[#f5f2eb]/40 transition-all duration-100">
            <td className="py-4 px-6 w-40">
              <span className={`inline-block w-28 text-center py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                exam.status === 'Evaluated'
                  ? 'bg-[#4a5d4e]/10 text-[#4a5d4e] border-[#4a5d4e]/20'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {exam.status === 'Evaluated' ? '✓ Evaluated' : '⏱ Pending'}
              </span>
            </td>
            <td className="py-4 px-6">
              <span className="font-bold text-[#1a202c] text-sm tracking-wide block">{exam.student}</span>
              <span className="text-[9px] text-[#8a9485] font-mono uppercase">{exam.curriculum} • ID: {exam.id}</span>
            </td>
            <td className="py-4 px-6 font-semibold text-[#4a5d4e]">
              {exam.batch}
            </td>
            <td className="py-4 px-6 font-mono text-[#8a9485] text-[11px]">
              {exam.date}
            </td>
          </tr>
        ))}
      </LocalTable>

    </div>
  );
}