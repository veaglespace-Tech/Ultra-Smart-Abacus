// src/app/dashboard/teacher/layout.jsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Sun, Moon, LayoutDashboard, Users, GraduationCap, 
  CalendarCheck, TrendingUp, FileSpreadsheet, CreditCard, 
  Bell, User, Settings, LogOut, Menu, X, Search 
} from "lucide-react";

export default function TeacherLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    router.push("/auth/login");
  };

  const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { name: 'My Batches', href: '/dashboard/teacher/batches', icon: Users },
    { name: 'Students', href: '/dashboard/teacher/students', icon: GraduationCap },
    { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: CalendarCheck },
    { name: 'Student Progress', href: '/dashboard/teacher/progress', icon: TrendingUp },
    { name: 'Exams', href: '/dashboard/teacher/exams', icon: FileSpreadsheet },
    { name: 'Payments', href: '/dashboard/teacher/payments', icon: CreditCard },
    { name: 'Notifications', href: '/dashboard/teacher/notifications', icon: Bell },
    { name: 'Profile', href: '/dashboard/teacher/profile', icon: User },
    { name: 'Settings', href: '/dashboard/teacher/settings', icon: Settings },
  ];

  const notifications = [
    { id: 1, text: "Exam 'Level 1 Core Midterm' marks pending review", time: "2 hours ago" },
    { id: 2, text: "Attendance for Batch Beta submitted successfully", time: "4 hours ago" },
    { id: 3, text: "New assessment added for Siddharth Joshi", time: "1 day ago" }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo */}
          <div className="mb-8 px-2">
            <h1 className="text-lg font-black tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/40 animate-pulse"></span> 
              ABACUS SYSTEM
            </h1>
            <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5">Teacher Workspace</p>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-250 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  <Icon size={16} className={`${isActive ? 'scale-110' : 'opacity-80'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
              TA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Teacher Admin</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Faculty Head</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-left text-xs text-rose-500 dark:text-rose-400 font-bold px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & SIDEBAR */}
      <div className="lg:hidden">
        {/* Toggle Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-slate-700 dark:text-slate-350"
        >
          <Menu size={20} />
        </button>

        {/* Drawer backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          />
        )}

        {/* Drawer Panel */}
        <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 z-50 p-6 flex flex-col justify-between transform transition-transform duration-300 shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-lg font-black tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <span className="w-3 h-3 bg-indigo-600 rounded-full"></span> 
                  ABACUS
                </h1>
                <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5">Workspace</p>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
                TA
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Teacher Admin</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase truncate text-left">Faculty Head</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-left text-xs text-rose-500 dark:text-rose-400 font-bold px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER / TOP NAVBAR */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shadow-sm relative z-30">
          {/* Left spacer for mobile menu */}
          <div className="w-12 lg:hidden"></div>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl w-64 md:w-80">
            <Search size={14} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search batches, students, grades..." 
              className="bg-transparent border-none text-xs focus:outline-none w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Right items */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Current Date */}
            <span className="hidden md:inline text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl">
              {currentDate}
            </span>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 transition-colors relative"
              >
                <Bell size={15} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Recent Alerts</h4>
                      <Link 
                        href="/dashboard/teacher/notifications" 
                        onClick={() => setNotificationOpen(false)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="text-xs border-b border-slate-50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                          <p className="text-slate-700 dark:text-slate-300 font-medium">{notif.text}</p>
                          <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
              aria-label="Toggle Theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} />
              )}
            </button>

            {/* Profile Avatar / Quick dropdown */}
            <Link href="/dashboard/teacher/profile" className="flex items-center gap-2 hover:opacity-90">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "TA"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {user?.name || "Teacher Admin"}
                </p>
                <span className="text-[9px] text-slate-400 font-bold">online</span>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
