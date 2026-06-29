"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminDataProvider, useAdminData } from "./AdminContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function AdminLayoutInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications } = useAdminData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/pages/auth/login");
  };

  // Determine active route name and active breadcrumb
  let activeTabName = "Overview";
  let activeTabId = "overview";
  if (pathname.endsWith("/users")) {
    activeTabName = "User Management";
    activeTabId = "users";
  } else if (pathname.endsWith("/franchise")) {
    activeTabName = "Franchise List";
    activeTabId = "franchise";
  } else if (pathname.endsWith("/inventory")) {
    activeTabName = "Inventory";
    activeTabId = "inventory";
  } else if (pathname.endsWith("/notifications")) {
    activeTabName = "Notifications";
    activeTabId = "notifications";
  } else if (pathname.endsWith("/reports")) {
    activeTabName = "Reports";
    activeTabId = "reports";
  } else if (pathname.endsWith("/settings")) {
    activeTabName = "System Settings";
    activeTabId = "settings";
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: "overview", label: "Overview", href: "/dashboard/admin", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { id: "users", label: "User Management", href: "/dashboard/admin/users", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.296 0-4.47-.679-6.305-1.848v-.005c0-2.243 4.072-4.022 9.08-4.022 1.247 0 2.447.11 3.565.32M13.81 12.036A4.47 4.47 0 0015 8.75c0-2.485-2.015-4.5-4.5-4.5S6 6.265 6 8.75c0 1.25.51 2.38 1.332 3.193m6.48 0a4.47 4.47 0 01-6.48 0m6.48 0a3.075 3.075 0 01-1.042.036m-4.396-.036a3.075 3.075 0 00-1.042-.036" },
    { id: "franchise", label: "Franchise List", href: "/dashboard/admin/franchise", icon: "M2.25 21h19.5m-18-10.5h16.5M2.25 9h19.5M2.25 15h19.5M2.25 18h19.5M3 3h18M3 6h18" },
    { id: "inventory", label: "Inventory", href: "/dashboard/admin/inventory", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
    { id: "notifications", label: "Notifications", href: "/dashboard/admin/notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
    { id: "reports", label: "Reports", href: "/dashboard/admin/reports", icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },
    { id: "settings", label: "System Settings", href: "/dashboard/admin/settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767c.379.29.507.82.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87a6.57 6.57 0 01-.22-.127a1.126 1.126 0 00-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.767a1.122 1.122 0 00.417-1.03a6.57 6.57 0 01-.006-.222c0-.074.002-.148.006-.222a1.122 1.122 0 00-.417-1.03l-1.003-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.645-.869l.214-1.28zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" }
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex relative overflow-hidden transition-colors duration-300">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[130px] pointer-events-none" />

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between transition-all duration-300 lg:transform-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        
        {/* Sidebar Header / Logo */}
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider uppercase text-slate-800 dark:text-white">
                Smart Abacus
              </h1>
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold uppercase tracking-widest">
                ERP Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((tab) => {
              const active = activeTabId === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "bg-blue-500/10 dark:bg-gradient-to-r dark:from-blue-500/25 dark:to-indigo-600/25 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.05)] dark:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                  {tab.id === "notifications" && unreadNotificationsCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3 border border-slate-150 dark:border-white/5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-800 border border-blue-500/30 flex items-center justify-center font-black text-xs text-blue-600 dark:text-blue-300">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Saideep Admin</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Super Administrator</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-250 dark:hover:border-rose-500/25 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN WINDOW CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto">
        
        {/* HEADER BAR */}
        <header className="border-b border-slate-250/60 dark:border-white/5 bg-white/40 dark:bg-slate-950/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
                <span>Dashboard</span>
                <span>/</span>
                <span>Admin</span>
                <span>/</span>
                <span className="text-blue-500 dark:text-blue-400">{activeTabId}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide capitalize mt-0.5">
                {activeTabName}
              </h2>
            </div>
          </div>

          {/* Live Date/Clock & Quick Stats */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {mounted && theme === "dark" ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} />
              )}
            </button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden md:block" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Admin Portal</span>
            </div>
          </div>
        </header>

        {/* VIEW SCENARIOS (CONTENT BODY) */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </div>
    </main>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminDataProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminDataProvider>
  );
}