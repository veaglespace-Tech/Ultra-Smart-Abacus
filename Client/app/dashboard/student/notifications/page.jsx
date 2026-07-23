"use client";

import React from "react";
import { useStudentData } from "../StudentContext";

export default function StudentNotificationsPage() {
  const { notifications } = useStudentData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">ANNOUNCEMENTS & NOTIFICATIONS FEED</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Read communication dispatches from academy teachers or system administrators.</p>
        </div>
      </div>

      {/* Notifications Listing */}
      <div className="space-y-4 max-w-3xl">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[10px]">
                  {notif.sender.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500">Sent by {notif.sender} • {notif.time}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-blue-500/10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Academy Alert
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed pl-11">
              {notif.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
