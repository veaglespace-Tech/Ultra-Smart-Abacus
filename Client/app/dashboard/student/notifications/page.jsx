"use client";

import React from "react";
import { useStudentData } from "../StudentContext";

export default function StudentNotificationsPage() {
  const { notifications } = useStudentData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <h3 className="text-sm font-bold text-white">Announcements & Notifications Feed</h3>
        <p className="text-[10px] text-slate-400 font-light mt-0.5">
          Read communication dispatches from academy teachers or system administrators.
        </p>
      </div>

      {/* Notifications Listing */}
      <div className="space-y-4 max-w-3xl">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 shadow-lg backdrop-blur-md hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-white/5 text-[10px]">
                  {notif.sender.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500">Sent by {notif.sender} • {notif.time}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-blue-500/10 bg-blue-500/10 text-blue-400">
                Academy Alert
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-4 leading-relaxed pl-11">
              {notif.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
