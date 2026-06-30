// src/app/dashboard/teacher/layout.jsx
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TeacherLayout({ children }) {
  const pathname = usePathname();

  const sidebarItems = [
    { name: 'Overview', href: '/dashboard/teacher', icon: '📊' },
    { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: '📝' },
    { name: 'Batches', href: '/dashboard/teacher/batches', icon: '👥' },
    { name: 'Exams', href: '/dashboard/teacher/exams', icon: '✍️' },
    { name: 'Progress', href: '/dashboard/teacher/progress', icon: '📈' },
    { name: 'Compensatory Classes', href: '/dashboard/teacher/compensatory-classes', icon: '🔄' },
    { name: 'Salary History', href: '/dashboard/teacher/salary-history', icon: '💰' },
  ];

  return (
    // Dynamic Gradient Background
    <div className="flex h-screen bg-gradient-to-br from-[#f1f5f9] via-[#e0e7ff] to-[#fae8ff] text-[#334155] font-sans antialiased p-4 gap-4">
      
      {/* SIDEBAR - Translucent Frosted Glass */}
      <aside className="w-66 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl flex flex-col justify-between p-6 select-none shadow-xl shadow-indigo-100/30">
        <div>
          {/* Logo */}
          <div className="mb-8 px-2">
            <h1 className="text-base font-black tracking-wider text-[#1e293b] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/40 animate-pulse"></span> 
              SMART ABACUS
            </h1>
            <p className="text-[9px] text-indigo-950/50 font-extrabold tracking-widest uppercase mt-0.5">Glass Console</p>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
                  }`}
                >
                  <span className={`text-sm ${isActive ? 'scale-110' : 'opacity-80'}`}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="border-t border-white/40 pt-4">
          <div className="flex items-center space-x-3 p-2.5 bg-white/50 border border-white/60 rounded-2xl mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
              TA
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Teacher Admin</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Faculty</p>
            </div>
          </div>
          <button className="w-full text-left text-[11px] text-red-500 font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
            🚪 Exit Session
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        
        {/* NAVBAR - Frosted Glass Glassmorphism */}
        <header className="h-16 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl px-8 flex items-center justify-between shadow-xl shadow-indigo-100/20">
          <div className="text-[9px] text-slate-400 font-extrabold tracking-widest uppercase">
            Workspace / <span className="text-indigo-600 font-black">Active Workspace</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-3 py-1 rounded-xl shadow-sm">
              ● Dynamic Interface Connected
            </span>
          </div>
        </header>

        {/* RENDER PAGES AREA */}
        <main className="flex-1 overflow-y-auto pr-1">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}