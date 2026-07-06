// src/app/dashboard/teacher/page.jsx
"use client";

import React, { useState } from 'react';
import { 
  Users, Layers, Calendar, CheckSquare, 
  GraduationCap, DollarSign, Play, CheckCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

function MetricCard({ title, value, subtext, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{value}</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

export default function TeacherOverviewPage() {
  const { user } = useAuth();
  const [classStatus, setClassStatus] = useState({});

  const stats = [
    { title: "Total Assigned Batches", value: "4", subtext: "Active abacus levels", icon: Layers, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
    { title: "Total Students", value: "42", subtext: "Active roster strength", icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450" },
    { title: "Today's Classes", value: "3 Scheduled", subtext: "Across Rooms A & B", icon: Calendar, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-450" },
    { title: "Attendance Percentage", value: "94.2%", subtext: "+1.2% from last week", icon: CheckSquare, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450" },
    { title: "Upcoming Exams", value: "2 Pending", subtext: "Scheduled this week", icon: GraduationCap, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-450" },
    { title: "Monthly Salary", value: "$3,200", subtext: "Payment status: Processed", icon: DollarSign, color: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450" },
  ];

  const todaySchedule = [
    { id: 1, batch: "Batch Alpha", time: "09:00 AM - 10:30 AM", room: "Classroom A", students: 14 },
    { id: 2, batch: "Batch Beta", time: "11:00 AM - 12:30 PM", room: "Classroom B", students: 12 },
    { id: 3, batch: "Batch Delta", time: "03:30 PM - 05:00 PM", room: "Classroom A", students: 16 }
  ];

  const handleStartClass = (id, batchName) => {
    setClassStatus(prev => ({
      ...prev,
      [id]: prev[id] === 'active' ? 'completed' : 'active'
    }));

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Welcome Back, {user?.name || "Instructor"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Observe current metrics, batch statistics, and schedule queues below.</p>
        </div>
        <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          📅 Academic Session: Active
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <MetricCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Weekly Attendance Trend (Line Chart SVG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Weekly Attendance Trend</h4>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">94.2% Avg</span>
          </div>
          <div className="h-48 flex items-center justify-center relative">
            {/* Custom SVG Line Chart */}
            <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="18" x2="100" y2="18" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="31" x2="100" y2="31" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="0.2" className="dark:stroke-slate-700" />
              
              {/* Area Under Line */}
              <path d="M 5 35 L 20 30 L 40 38 L 60 15 L 80 18 L 95 8 L 95 40 L 5 40 Z" fill="url(#lineGrad)" />
              
              {/* Line path */}
              <path 
                d="M 5 35 L 20 30 L 40 38 L 60 15 L 80 18 L 95 8" 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              
              {/* Dots */}
              <circle cx="5" cy="35" r="1.5" fill="#4f46e5" className="cursor-pointer hover:r-2 transition-all" />
              <circle cx="20" cy="30" r="1.5" fill="#4f46e5" />
              <circle cx="40" cy="38" r="1.5" fill="#4f46e5" />
              <circle cx="60" cy="15" r="1.5" fill="#4f46e5" />
              <circle cx="80" cy="18" r="1.5" fill="#4f46e5" />
              <circle cx="95" cy="8" r="1.5" fill="#4f46e5" />

              {/* Labels */}
              <text x="5" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Mon</text>
              <text x="20" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Tue</text>
              <text x="40" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Wed</text>
              <text x="60" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Thu</text>
              <text x="80" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Fri</text>
              <text x="95" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Sat</text>
            </svg>
          </div>
        </div>

        {/* Student Performance (Bar Chart SVG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Performance Overview</h4>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">By Level</span>
          </div>
          <div className="h-48 flex items-center justify-center relative">
            <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="18" x2="100" y2="18" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="31" x2="100" y2="31" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="0.2" className="dark:stroke-slate-700" />

              {/* Bars */}
              {/* Level 1 */}
              <rect x="12" y="10" width="10" height="30" rx="1.5" fill="#4f46e5" />
              {/* Level 2 */}
              <rect x="34" y="15" width="10" height="25" rx="1.5" fill="#3b82f6" />
              {/* Level 3 */}
              <rect x="56" y="8" width="10" height="32" rx="1.5" fill="#8b5cf6" />
              {/* Level 4 */}
              <rect x="78" y="20" width="10" height="20" rx="1.5" fill="#f59e0b" />

              {/* Labels */}
              <text x="17" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Lvl 1</text>
              <text x="39" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Lvl 2</text>
              <text x="61" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Lvl 3</text>
              <text x="83" y="44" fontSize="3" textAnchor="middle" className="fill-slate-400 font-semibold">Lvl 4</text>
            </svg>
          </div>
        </div>

        {/* Batch Distribution (Donut Chart SVG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Batch Distribution</h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">4 Batches</span>
          </div>
          <div className="h-48 flex items-center justify-between">
            {/* Donut Chart SVG */}
            <div className="w-1/2 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-28 h-28 transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#cbd5e1" strokeWidth="3" className="dark:stroke-slate-800" />
                
                {/* Batch Alpha - 33% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4f46e5" strokeWidth="3.2" strokeDasharray="33 67" strokeDashoffset="0" />
                {/* Batch Beta - 28% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3.2" strokeDasharray="28 72" strokeDashoffset="-33" />
                {/* Batch Gamma - 24% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3.2" strokeDasharray="24 76" strokeDashoffset="-61" />
                {/* Batch Delta - 15% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray="15 85" strokeDashoffset="-85" />
              </svg>
            </div>
            {/* Legend */}
            <div className="w-1/2 space-y-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 pl-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Alpha (33%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Beta (28%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Gamma (24%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Delta (15%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Today's Schedule Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Today's Class Queue</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {todaySchedule.map((cls) => {
            const status = classStatus[cls.id];
            return (
              <div key={cls.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{cls.batch}</h5>
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/50">
                      {cls.room}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">🕒 {cls.time}</p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cls.students} Students</span>
                  <button
                    onClick={() => handleStartClass(cls.id, cls.batch)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      status === 'active'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                        : status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
                    }`}
                  >
                    {status === 'active' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        <span>In Progress</span>
                      </>
                    ) : status === 'completed' ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} fill="currentColor" />
                        <span>Start Class</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}