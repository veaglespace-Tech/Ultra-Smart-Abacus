// src/app/dashboard/teacher/progress/page.jsx
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

export default function TeacherProgressPage() {
  const [studentProgress] = useState([
    { id: 'STU-101', name: 'Abhishek Kulkarni', batch: 'Batch Alpha', level: 'Level 1 Core', speedRating: 'Excellent', totalPages: 142, accuracy: '92%' },
    { id: 'STU-102', name: 'Pranjal Patil', batch: 'Batch Alpha', level: 'Level 1 Core', speedRating: 'Steady', totalPages: 128, accuracy: '88%' },
    { id: 'STU-103', name: 'Siddharth Joshi', batch: 'Batch Beta', level: 'Level 3 Advanced', speedRating: 'Accelerated', totalPages: 210, accuracy: '95%' },
    { id: 'STU-104', name: 'Rohan Deshmukh', batch: 'Batch Beta', level: 'Level 3 Advanced', speedRating: 'Needs Practice', totalPages: 94, accuracy: '76%' }
  ]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black text-[#1a202c] tracking-tight uppercase">Student Progress Analytics</h2>
          <p className="text-[11px] text-[#8a9485] font-medium mt-0.5">Observe real-time speed, accuracy, and total workbook telemetry across your rosters.</p>
        </div>
      </div>

      {/* PROGRESS TRACKING TABLE */}
      <LocalTable headers={["Student Identity Ledger", "Active Level Track", "Pace Status", "Total Pages", "Accuracy Matrix"]}>
        {studentProgress.map((student) => (
          <tr key={student.id} className="hover:bg-[#f5f2eb]/40 transition-all duration-100">
            {/* Student Info */}
            <td className="py-4 px-6">
              <span className="font-bold text-[#1a202c] text-sm tracking-wide block">{student.name}</span>
              <span className="text-[9px] text-[#8a9485] font-mono uppercase">{student.batch} • ID: {student.id}</span>
            </td>
            
            {/* Level Track */}
            <td className="py-4 px-6 font-semibold text-[#4a5d4e]">
              {student.level}
            </td>

            {/* Pace Badge */}
            <td className="py-4 px-6 w-44">
              <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                student.speedRating === 'Excellent' || student.speedRating === 'Accelerated'
                  ? 'bg-[#4a5d4e]/10 text-[#4a5d4e] border-[#4a5d4e]/20'
                  : student.speedRating === 'Steady'
                  ? 'bg-blue-50/60 text-blue-700 border-blue-100'
                  : 'bg-rose-50/60 text-rose-700 border-rose-100'
              }`}>
                {student.speedRating}
              </span>
            </td>

            {/* Total Pages */}
            <td className="py-4 px-6 font-mono font-bold text-[#2c3539]">
              {student.totalPages} pgs
            </td>

            {/* Accuracy */}
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1a202c]">{student.accuracy}</span>
                <div className="w-16 bg-[#f4f0e6] h-1.5 rounded-full overflow-hidden border border-[#e2dcd0]/60">
                  <div 
                    className="bg-[#4a5d4e] h-full rounded-full" 
                    style={{ width: student.accuracy }}
                  />
                </div>
              </div>
            </td>
          </tr>
        ))}
      </LocalTable>

    </div>
  );
}