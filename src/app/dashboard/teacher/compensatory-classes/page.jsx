// src/app/dashboard/teacher/compensatory/page.jsx
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

export default function CompensatoryClassesPage() {
  const [compensatorySlots, setCompensatorySlots] = useState([
    { id: 'CC-901', student: 'Pranjal Patil', originalMissedBatch: 'Batch Alpha (Sat)', compensationTime: 'Friday 04:00 PM', status: 'Scheduled', mentorNotes: 'Missed Level 1 formulas logic setup.' },
    { id: 'CC-902', student: 'Rohan Deshmukh', originalMissedBatch: 'Batch Beta (Mon-Wed)', compensationTime: 'Thursday 05:30 PM', status: 'Completed', mentorNotes: 'Completed book 3 milestone review.' },
    { id: 'CC-903', student: 'Abhishek Kulkarni', originalMissedBatch: 'Batch Alpha (Sat)', compensationTime: 'Sunday 11:00 AM', status: 'Scheduled', mentorNotes: 'Speed drill balancing missing assignment.' }
  ]);

  const toggleStatus = (slotId) => {
    setCompensatorySlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const nextStatus = slot.status === 'Scheduled' ? 'Completed' : 'Scheduled';
        return { ...slot, status: nextStatus };
      }
      return slot;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black text-[#1a202c] tracking-tight uppercase">Compensatory Clearances</h2>
          <p className="text-[11px] text-[#8a9485] font-medium mt-0.5">Track, schedule, and mark off makeup slots assigned for missing regular workspace routines.</p>
        </div>
      </div>

      {/* COMPENSATORY RUNTIME TABLE */}
      <LocalTable headers={["Action Registry", "Student identity", "Target Timeline Node", "Contextual Notes"]}>
        {compensatorySlots.map((slot) => (
          <tr key={slot.id} className="hover:bg-[#f5f2eb]/40 transition-all duration-100">
            {/* Action Checkbox Toggle */}
            <td className="py-4 px-6 w-44">
              <button
                onClick={() => toggleStatus(slot.id)}
                className={`w-32 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer border ${
                  slot.status === 'Completed'
                    ? 'bg-[#4a5d4e]/10 text-[#4a5d4e] border-[#4a5d4e]/20'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {slot.status === 'Completed' ? '✓ COMPLETED' : '⏱ SCHEDULED'}
              </button>
            </td>

            {/* Student Identity and historical log */}
            <td className="py-4 px-6">
              <span className="font-bold text-[#1a202c] text-sm tracking-wide block">{slot.student}</span>
              <span className="text-[9px] text-[#8a9485] font-mono uppercase">Missed: {slot.originalMissedBatch}</span>
            </td>

            {/* Compensation Date Target */}
            <td className="py-4 px-6 font-semibold text-[#1a202c]">
              <span className="text-xs block font-bold text-[#4a5d4e]">{slot.compensationTime}</span>
              <span className="text-[9px] text-[#8a9485] font-mono uppercase">Node ID: {slot.id}</span>
            </td>

            {/* Notes Section */}
            <td className="py-4 px-6 text-[#5a6455] italic max-w-xs truncate">
              {slot.mentorNotes}
            </td>
          </tr>
        ))}
      </LocalTable>

    </div>
  );
}