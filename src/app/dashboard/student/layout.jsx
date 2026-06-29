"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StudentDataProvider, useStudentData } from "./StudentContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
// Refined icons
import { 
  LayoutDashboard, Calendar, BarChart3, Award, 
  CreditCard, Bell, User, LogOut, Menu, Grid, Sun, Moon
} from "lucide-react";

function StudentLayoutInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useStudentData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/pages/auth/login");
  };

  // Active route and active tab ID tracking
  let activeTabName = "Overview";
  let activeTabId = "overview";

  if (pathname.endsWith("/exams")) {
    activeTabName = "Exams";
    activeTabId = "exams";
  } else if (pathname.endsWith("/fees")) {
    activeTabName = "Fees / Invoices";
    activeTabId = "fees";
  } else if (pathname.endsWith("/notifications")) {
    activeTabName = "Notifications";
    activeTabId = "notifications";
  } else if (pathname.endsWith("/profile")) {
    activeTabName = "My Profile";
    activeTabId = "profile";
  } else if (pathname.endsWith("/progress")) {
    activeTabName = "Learning Progress";
    activeTabId = "progress";
  } else if (pathname.endsWith("/attendance")) {
    activeTabName = "Class Attendance";
    activeTabId = "attendance";
  }

  const navLinks = [
    { id: "overview", label: "Overview", href: "/dashboard/student", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "attendance", label: "Attendance", href: "/dashboard/student/attendance", icon: <Calendar className="w-5 h-5" /> },
    { id: "progress", label: "Progress", href: "/dashboard/student/progress", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "exams", label: "Exams", href: "/dashboard/student/exams", icon: <Award className="w-5 h-5" /> },
    { id: "fees", label: "Fees / Invoices", href: "/dashboard/student/fees", icon: <CreditCard className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/dashboard/student/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "profile", label: "My Profile", href: "/dashboard/student/profile", icon: <User className="w-5 h-5" /> }
  ];

  return (
    <main className="min-h-screen bg-[#edf2f9] dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-sans flex relative overflow-hidden p-3 md:p-4 gap-4 transition-colors duration-300">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-xs transition-all"
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 rounded-3xl bg-white dark:bg-slate-900 p-6 flex flex-col justify-between border border-slate-200/60 dark:border-slate-800 shadow-xs transition-all duration-300 lg:transform-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        
        {/* Sidebar Header / Logo */}
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
            <div>
              <h1 className="font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-white">
                Smart Abacus
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                Student Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((tab) => {
              const active = activeTabId === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/10 dark:shadow-none"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className={active ? "text-white" : "text-slate-400 dark:text-slate-500"}>
                    {tab.icon}
                  </div>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Profile Info */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-3 border border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center font-bold text-xs">
                {profile.name ? profile.name.charAt(0) : "S"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{profile.name}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">Level {profile.level} Student</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN WINDOW CONTAINER */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        
        {/* HEADER BAR */}
        <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-30 mb-2">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 border border-slate-200/60 dark:border-slate-800 shadow-xs"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="block">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-[#4f46e5]">{activeTabId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {mounted && theme === "dark" ? (
                <Sun size={14} className="text-amber-400" />
              ) : (
                <Moon size={14} />
              )}
            </button>

            {/* Live Status Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#137333] dark:text-emerald-400 text-xs font-bold tracking-wide border dark:border-emerald-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#137333] dark:bg-emerald-400 animate-pulse" />
              Live Sync Active
            </div>
          </div>
        </header>

        {/* VIEW SCENARIOS (CONTENT BODY) */}
        <div className="px-4 pb-4 flex-1">
          {children}
        </div>
      </div>
    </main>
  );
}

export default function StudentLayout({ children }) {
  return (
    <StudentDataProvider>
      <StudentLayoutInner>{children}</StudentLayoutInner>
    </StudentDataProvider>
  );
}