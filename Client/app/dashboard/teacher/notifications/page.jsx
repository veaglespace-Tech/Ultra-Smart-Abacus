// src/app/dashboard/teacher/notifications/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Award, Calendar, FileSpreadsheet, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';

export default function TeacherNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.teacher.getNotifications();
      const list = (res.data || []).map(n => {
        let typeIcon = Bell;
        let typeColor = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
        if (n.type === "EXAM") {
          typeIcon = FileSpreadsheet;
          typeColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
        } else if (n.type === "ATTENDANCE") {
          typeIcon = CheckCircle2;
          typeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";
        } else if (n.type === "ANNOUNCEMENT") {
          typeIcon = Bell;
          typeColor = "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
        }
        return {
          id: n.id,
          type: n.type.toLowerCase(),
          title: n.title,
          text: n.message,
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
          icon: typeIcon,
          color: typeColor
        };
      });
      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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