// src/app/dashboard/teacher/batches/page.jsx
"use client";
import React, { useState } from 'react';

function BatchCard({ name, level, studentsCount, timing, room }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-5 rounded-xl shadow-sm shadow-[#4a5d4e]/5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-black text-[#1a202c] tracking-wide">{name}</h3>
          <span className="px-2.5 py-0.5 bg-[#4a5d4e]/10 text-[#4a5d4e] rounded-md text-[10px] font-bold uppercase tracking-wider">
            {level}
          </span>
        </div>
        <p className="text-[11px] text-[#8a9485] font-mono mt-2 font-bold flex items-center gap-1.5">
          🕒 {timing}
        </p>
      </div>

      <div className="border-t border-[#e2dcd0]/50 pt-3 flex justify-between items-center text-xs">
        <span className="text-[#4a5d4e] font-medium">
          Roster: <strong className="text-[#1a202c] font-bold">{studentsCount} Students</strong>
        </span>
        <span className="text-[11px] text-[#8a9485] bg-[#f4f0e6] px-2 py-0.5 rounded border border-[#e2dcd0]/40">
          {room}
        </span>
      </div>
    </div>
  );
}

export default function TeacherBatchesPage() {
  const [batches] = useState([
    { id: 1, name: "Batch Alpha", level: "Level 1 Core", studentsCount: 14, timing: "Sat: 09:00 AM - 10:30 AM", room: "Room A" },
    { id: 2, name: "Batch Beta", level: "Level 3 Advanced", studentsCount: 12, timing: "Mon-Wed: 11:00 AM - 12:30 PM", room: "Room B" },
    { id: 3, name: "Batch Gamma", level: "Level 2 Foundations", studentsCount: 16, timing: "Sun: 03:30 PM - 05:00 PM", room: "Room A" },
    { id: 4, name: "Batch Delta", level: "Level 4 Master", studentsCount: 10, timing: "Fri: 05:30 PM - 07:00 PM", room: "Room B" }
  ]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black text-[#1a202c] tracking-tight uppercase">Batch Allocations</h2>
          <p className="text-[11px] text-[#8a9485] font-medium mt-0.5">Manage and observe your currently deployed runtime rosters.</p>
        </div>
      </div>

      {/* BATCH CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {batches.map((batch) => (
          <BatchCard 
            key={batch.id} 
            name={batch.name} 
            level={batch.level} 
            studentsCount={batch.studentsCount} 
            timing={batch.timing} 
            room={batch.room} 
          />
        ))}
      </div>

    </div>
  );
}