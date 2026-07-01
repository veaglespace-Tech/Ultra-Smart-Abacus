// src/app/dashboard/teacher/notifications/page.jsx
"use client";

import React, { useState } from 'react';
import { Bell, Award, Calendar, FileSpreadsheet, CheckCircle2, Trash2 } from 'lucide-react';

export default function TeacherNotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'exam', title: "Exam Marks Pending Review", text: "Exam 'Level 1 Core Midterm' marks have been logged. Please review and publish the results.", time: "2 hours ago", icon: FileSpreadsheet, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { id: 2, type: 'attendance', title: "Batch Beta Attendance Synchronized", text: "Attendance logs for Batch Beta (Mon-Wed) were successfully pushed to server records.", time: "4 hours ago", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { id: 3, type: 'progress', title: "New Progress Assessment Logged", text: "A Level 3 Advanced evaluation card has been successfully attached to student Siddharth Joshi.", time: "1 day ago", icon: Award, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
    { id: 4, type: 'payment', title: "Salary Payout Disbursed", text: "June monthly payroll of $3,200 has been credited to your registered bank account.", time: "1 day ago", icon: CheckCircle2, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
    { id: 5, type: 'batch', title: "Upcoming Batch Delta Activation", text: "Batch Delta (Level 4 Master) is scheduled to start on Friday, 05:30 PM in Room B.", time: "3 days ago", icon: Calendar, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" }
  ]);

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">ALERTS & NOTIFICATIONS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Stay updated with classroom scheduling milestones and grading reviews.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-bold transition-all hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* NOTIFICATIONS CONTAINER */}
      <div className="max-w-2xl space-y-4">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div 
              key={n.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl ${n.color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-105 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 font-medium leading-relaxed">{n.text}</p>
                  <span className="text-[10px] text-slate-400 font-bold block">{n.time}</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(n.id)}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 text-center py-16 text-xs text-slate-400 dark:text-slate-500 rounded-2xl bg-white dark:bg-slate-900 font-bold">
            <Bell size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
            <span>No new notifications at this time.</span>
          </div>
        )}
      </div>

    </div>
  );
}
