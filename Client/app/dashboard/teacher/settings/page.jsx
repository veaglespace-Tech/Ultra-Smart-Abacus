// src/app/dashboard/teacher/settings/page.jsx
"use client";

import React, { useState } from 'react';
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Bell, Shield, Eye, Globe, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TeacherSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
  const [lang, setLang] = useState('en');
  const [notifs, setNotifs] = useState({
    exams: true,
    attendance: true,
    payments: true,
    marketing: false
  });

  const [savingSettings, setSavingSettings] = useState(false);

  const handleToggleNotif = (key) => {
    setNotifs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.8 }
      });
      alert("Faculty preferences saved successfully.");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">SETTINGS & PREFERENCES</h2>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">Configure appearance theme, primary system language, and alarm triggers.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        
        {/* THEME SELECTOR */}
        <div className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-850">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Eye size={14} />
            <span>Appearance Theme</span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { if (theme === "dark") toggleTheme(); }}
              className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Sun size={15} />
                <span>Light Mode</span>
              </div>
              {theme === 'light' && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
            </button>
            
            <button
              onClick={() => { if (theme === "light") toggleTheme(); }}
              className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400 font-bold'
                  : 'border-slate-200 dark:border-slate-850 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Moon size={15} />
                <span>Dark Mode</span>
              </div>
              {theme === 'dark' && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
            </button>
          </div>
        </div>

        

        {/* ALERTS PREFERENCES */}
        <div className="space-y-3.5 pb-5">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Bell size={14} />
            <span>System Notifications Triggers</span>
          </h3>
          
          <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-850 rounded-xl cursor-pointer">
              <div className="space-y-0.5">
                <p className="text-slate-900 dark:text-slate-100 font-bold">Exam Scheduling Alerts</p>
                <p className="text-[10px] text-slate-450">Notify when new exams are created or need marks input.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifs.exams}
                onChange={() => handleToggleNotif('exams')}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-850 rounded-xl cursor-pointer">
              <div className="space-y-0.5">
                <p className="text-slate-900 dark:text-slate-100 font-bold">Roster Attendance Sync</p>
                <p className="text-[10px] text-slate-450">Confirmations upon batch attendance record upload.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifs.attendance}
                onChange={() => handleToggleNotif('attendance')}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-850 rounded-xl cursor-pointer">
              <div className="space-y-0.5">
                <p className="text-slate-900 dark:text-slate-100 font-bold">Salary Credit Notifications</p>
                <p className="text-[10px] text-slate-450">Remind upon Monthly Salary payment completion status.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifs.payments}
                onChange={() => handleToggleNotif('payments')}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SAVE PREFERENCES BUTTON */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
          <button 
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
          >
            {savingSettings ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>

      </div>

    </div>
  );
}
