"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StudentDataProvider, useStudentData } from "./StudentContext";
// स्क्रीनशॉटमधील ब्रँडिंग मॅच करण्यासाठी रिफाइंड आयकॉन्स
import { 
  LayoutDashboard, Calendar, BarChart3, Award, 
  CreditCard, Bell, User, LogOut, Menu, Grid
} from "lucide-react";

function StudentLayoutInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useStudentData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    router.push("/login");
  };

  // Active route आणि active tab ID ट्रॅक करणे
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
    <main className="min-h-screen bg-[#edf2f9] text-slate-700 font-sans flex relative overflow-hidden p-3 md:p-4 gap-4">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-all"
        />
      )}

      {/* SIDEBAR PANEL - स्क्रीनशॉटमधील सॉलिड व्हाईट राऊंडेड ब्लॉकप्रमाणे */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 rounded-3xl bg-white p-6 flex flex-col justify-between border border-slate-200/60 shadow-xs transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        
        {/* Sidebar Header / Logo */}
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
            <div>
              <h1 className="font-extrabold text-sm tracking-wider uppercase text-slate-900">
                Smart Abacus
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Student Console
              </span>
            </div>
          </div>

          {/* Navigation Links - स्क्रीनशॉटमधील सॉलिड व्हायब्रंट ब्लू/जांभळा लूक */}
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
                      ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className={active ? "text-white" : "text-slate-400"}>
                    {tab.icon}
                  </div>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Profile Info */}
        <div className="border-t border-slate-100 pt-4">
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-[#4f46e5]">
                {profile.name ? profile.name.charAt(0) : "S"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{profile.name}</p>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Level {profile.level} Student</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all"
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
              className="lg:hidden p-2 rounded-xl bg-white text-slate-600 border border-slate-200/60 shadow-xs"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="block">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-[#4f46e5]">{activeTabId}</span>
              </div>
            </div>
          </div>

          {/* Live Status Display (तंतोतंत स्क्रीनशॉट सारखा ग्रीन कॅप्सूल पॅच) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e6f4ea] text-[#137333] text-xs font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
            Live Sync Active
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