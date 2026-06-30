// src/app/dashboard/teacher/page.jsx
"use client";
import React, { useState, useEffect } from 'react';

function MetricCard({ title, value, subtext, icon }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-5 rounded-xl shadow-sm shadow-[#4a5d4e]/5 flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] text-[#8a9485] uppercase font-bold tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-[#1a202c] tracking-tight">{value}</h3>
        <p className="text-[11px] text-[#4a5d4e] font-medium">{subtext}</p>
      </div>
      <div className="p-2.5 bg-[#f4f0e6] rounded-lg text-lg border border-[#e2dcd0]/60">
        {icon}
      </div>
    </div>
  );
}

export default function TeacherOverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 42,
    activeBatches: 4,
    todayAttendance: "94%",
    pendingExams: 2
  });

  const [schedule, setSchedule] = useState([
    { id: 1, time: "09:00 AM - 10:30 AM", batch: "Batch Alpha", level: "Level 1 Core", room: "Room A" },
    { id: 2, time: "11:00 AM - 12:30 PM", batch: "Batch Beta", level: "Level 3 Advanced", room: "Room B" },
    { id: 3, time: "03:30 PM - 05:00 PM", batch: "Batch Gamma", level: "Level 2 Foundations", room: "Room A" }
  ]);

  return (
    <div className="space-y-8">
      
      {/* HEADER WELCOME BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#e2dcd0] pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1a202c] tracking-tight">Welcome Back, Instructor</h2>
          <p className="text-xs text-[#8a9485] font-medium mt-0.5">Here is a quick telemetry slice of your Smart Abacus workspace for today.</p>
        </div>
        <div className="text-xs font-bold text-[#4a5d4e] bg-[#f4f0e6] px-3 py-1.5 rounded-lg border border-[#e2dcd0]">
          📅 Session Workspace: Active
        </div>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total Roster" value={stats.totalStudents} subtext="Active students assigned" icon="👥" />
        <MetricCard title="Active Batches" value={stats.activeBatches} subtext="Allocated runtime groups" icon="📊" />
        <MetricCard title="Today's Attendance" value={stats.todayAttendance} subtext="Logs synchronized today" icon="📝" />
        <MetricCard title="Pending Review" value={stats.pendingExams} subtext="Exams awaiting marking" icon="✍️" />
      </div>

      {/* SCHEDULE WORKSPACE LAYOUT */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-0.5">
          <h4 className="text-xs font-black uppercase text-[#7a8475] tracking-widest">Today's Class Queue</h4>
          <span className="text-[10px] text-[#8a9485] font-mono uppercase font-bold">Auto-refreshing</span>
        </div>

        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm shadow-[#4a5d4e]/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-widest text-[#7a8475]">
                  <th className="py-4 px-6">Timeline Slot</th>
                  <th className="py-4 px-6">Batch Identity</th>
                  <th className="py-4 px-6">Curriculum Track</th>
                  <th className="py-4 px-6">Location Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dcd0]/50 text-xs text-[#2c3539] font-medium">
                {schedule.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f5f2eb]/40 transition-all duration-100">
                    <td className="py-4 px-6 text-[#4a5d4e] font-mono font-bold">{item.time}</td>
                    <td className="py-4 px-6 font-bold text-[#1a202c]">{item.batch}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-[#4a5d4e]/10 text-[#4a5d4e] rounded-md text-[11px] font-bold">
                        {item.level}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#8a9485]">{item.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}