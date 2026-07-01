"use client";

import React, { useState } from "react";
import { useAdminData } from "../AdminContext";

export default function NotificationsPage() {
  const {
    notifications,
    addNotification,
    markNotificationRead,
    deleteNotification
  } = useAdminData();

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("All");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    const newNotification = {
      id: Date.now(),
      type: "info",
      title: `${title} (To: ${targetAudience})`,
      message,
      time: "Just now",
      read: false
    };

    addNotification(newNotification);

    setTitle("");
    setMessage("");
    setTargetAudience("All");
    
    setSuccessMsg("Broadcast sent successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Toolbar */}
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">System Alerts & Notifications</h3>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">Disseminate notices, review automated inventory warnings, and inspect activity logs.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              notifications.forEach(n => markNotificationRead(n.id));
            }}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-[11px] text-slate-300 font-semibold transition-all cursor-pointer"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Broadcast Sender Form */}
        <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-slate-900/40 p-5 shadow-lg backdrop-blur-md h-fit">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4">
            Broadcast New Announcement
          </h4>

          {successMsg && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-300 mb-4 animate-fade-in flex items-center gap-1.5">
              <span>✔</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Server Maintenance / Fee Revision"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="All">All Portal Users</option>
                <option value="Teachers">Certified Teachers</option>
                <option value="Franchise Owners">Franchise Owners</option>
                <option value="Students">Active Students</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Message Body *
              </label>
              <textarea
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your notice description here..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Dispatch Broadcast
            </button>
          </form>
        </div>

        {/* Notifications Feed */}
        <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-slate-900/40 p-5 shadow-lg backdrop-blur-md">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4 flex justify-between items-center">
            <span>Alert & Announcement Feed</span>
            <span className="text-[9px] text-slate-500 font-mono tracking-normal">
              {notifications.length} active notices
            </span>
          </h4>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (n.type === "alert") badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                else if (n.type === "system") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";

                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-3.5 rounded-xl border transition-colors ${
                      n.read
                        ? "bg-white/[0.01] border-white/5 text-slate-400"
                        : "bg-white/[0.04] border-white/10 text-slate-200"
                    }`}
                  >
                    {/* Status dot */}
                    <div className="pt-1 flex-shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full block ${
                        n.read ? "bg-slate-600" : "bg-blue-400 animate-pulse"
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-bold truncate">{n.title}</h5>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                          {n.type}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed mt-1 text-slate-300 font-light">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-500 block mt-2 font-mono">
                        {n.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-center">
                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] px-2 font-bold cursor-pointer"
                          title="Mark Read"
                        >
                          Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 rounded bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 font-light text-xs">
                No active notifications or alerts.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
