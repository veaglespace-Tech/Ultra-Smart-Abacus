"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { AdminDataProvider, useAdminData } from "./AdminContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, LayoutDashboard, Users, Grid, Box,
  Bell, BarChart3, Settings, LogOut, Menu, X, Search
} from "lucide-react";

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const { logout, user } = useAuth();
  const { notifications, markNotificationRead } = useAdminData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("read_notifications_admin") || "[]");
      setReadNotificationIds(stored);
    }
  }, []);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    router.push("/auth/login");
  };

  const handleToggleNotifications = () => {
    const nextState = !notificationOpen;
    setNotificationOpen(nextState);
    if (nextState && notifications && notifications.length > 0) {
      const allIds = notifications.map(n => n.id);
      setReadNotificationIds(allIds);
      if (typeof window !== "undefined") {
        localStorage.setItem("read_notifications_admin", JSON.stringify(allIds));
      }
      notifications.forEach(n => {
        if (markNotificationRead) markNotificationRead(n.id);
      });
    }
  };

  const sidebarItems = [
    { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Franchise List', href: '/dashboard/admin/franchise', icon: Grid },
    { name: 'Inventory', href: '/dashboard/admin/inventory', icon: Box },
    { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const unreadNotificationsCount = notifications ? notifications.filter(n => !n.read && !readNotificationIds.includes(n.id)).length : 0;
  const adminName = isClientMounted && user?.name ? user.name : "Saideep Admin";
  const adminInitials = isClientMounted && adminName
    ? adminName.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="flex h-screen bg-[#FFF8F0] dark:bg-[#150e2a] text-[#1a1035] dark:text-[#f0ebff] font-sans antialiased transition-colors duration-300 w-full overflow-hidden">

      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#150e2a] border-r border-[#3d2a88]/15 dark:border-[#3d2a88]/30 p-6 justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2 mb-8 group">
            <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69] to-[#FF6B2B] rounded-lg opacity-90 transition-opacity shadow-md" />
              <svg viewBox="0 0 32 32" className="relative w-5 h-5" fill="none">
                <rect x="3" y="4" width="26" height="24" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="10" y1="4" x2="10" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1"/>
                <line x1="16" y1="4" x2="16" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1"/>
                <line x1="22" y1="4" x2="22" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1"/>
                <line x1="3" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1" strokeDasharray="1.5 1"/>
                <circle cx="10" cy="11" r="2" fill="#FFCA28"/>
                <circle cx="16" cy="13" r="2" fill="#FF6B2B"/>
                <circle cx="22" cy="11" r="2" fill="#FFCA28"/>
                <circle cx="10" cy="22" r="2" fill="white" fillOpacity="0.7"/>
                <circle cx="16" cy="21" r="2" fill="white" fillOpacity="0.7"/>
                <circle cx="22" cy="22" r="2" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                <span className="text-[#2D1B69] dark:text-violet-300">SMART</span>{" "}
                <span className="text-[#FF6B2B]">ABACUS</span>
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-[#2D1B69]/60 dark:text-violet-400/60 uppercase mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                ERP Admin
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-250 ${
                    isActive
                      ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-md shadow-[#FF6B2B]/20"
                      : "text-slate-655 dark:text-slate-400 hover:bg-accent/10 dark:hover:bg-accent/15 hover:text-[#FF6B2B] dark:hover:text-accent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} className={`${isActive ? 'scale-110 text-white' : 'text-accent opacity-90'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.name === 'Notifications' && unreadNotificationsCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${isActive ? 'bg-white text-orange-600' : 'bg-orange-550 text-white bg-[#FF6B2B]'}`}>
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-[#3d2a88]/15 dark:border-[#3d2a88]/30 pt-4">
          <div className="flex items-center space-x-3 p-2 bg-[#FFF8F0]/80 dark:bg-[#2D1B69]/30 border border-[#3d2a88]/15 dark:border-[#3d2a88]/30 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-light/30 text-primary dark:text-cream flex items-center justify-center text-xs font-black border border-primary/20 dark:border-[#3d2a88]/40">
              {adminInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{adminName}</p>
              <p className="text-[9px] text-slate-455 dark:text-slate-500 font-bold uppercase truncate">Super Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-left text-xs text-rose-500 dark:text-rose-455 font-bold px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-955/20 transition-colors"
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
          className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-white dark:bg-[#150e2a] border border-[#3d2a88]/15 dark:border-[#3d2a88]/30 shadow-md text-slate-700 dark:text-slate-350"
        >
          <Menu size={20} />
        </button>

        {/* Drawer backdrop & panel wrapped in AnimatePresence */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-45"
              />

              {/* Drawer Panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#150e2a] z-50 p-6 flex flex-col justify-between shadow-2xl"
              >
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 group">
                      <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69] to-[#FF6B2B] rounded-lg opacity-90 transition-opacity shadow-md" />
                        <svg viewBox="0 0 32 32" className="relative w-5 h-5" fill="none">
                          <rect x="3" y="4" width="26" height="24" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                          <line x1="10" y1="4" x2="10" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1"/>
                          <line x1="16" y1="4" x2="16" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1"/>
                          <line x1="22" y1="4" x2="22" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1"/>
                          <line x1="3" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1" strokeDasharray="1.5 1"/>
                          <circle cx="10" cy="11" r="2" fill="#FFCA28"/>
                          <circle cx="16" cy="13" r="2" fill="#FF6B2B"/>
                          <circle cx="22" cy="11" r="2" fill="#FFCA28"/>
                          <circle cx="10" cy="22" r="2" fill="white" fillOpacity="0.7"/>
                          <circle cx="16" cy="21" r="2" fill="white" fillOpacity="0.7"/>
                          <circle cx="22" cy="22" r="2" fill="white" fillOpacity="0.7"/>
                        </svg>
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="font-black text-sm tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                          <span className="text-[#2D1B69] dark:text-violet-300">SMART</span>{" "}
                          <span className="text-[#FF6B2B]">ABACUS</span>
                        </span>
                        <span className="text-[9px] font-semibold tracking-wider text-[#2D1B69]/60 dark:text-violet-400/60 uppercase mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                          ERP Admin
                        </span>
                      </div>
                    </Link>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-350"
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
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-md shadow-[#FF6B2B]/20"
                              : "text-slate-655 dark:text-slate-400 hover:bg-accent/10 dark:hover:bg-accent/15 hover:text-[#FF6B2B] dark:hover:text-accent"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon size={16} className={`${isActive ? 'scale-110 text-white' : 'text-accent opacity-90'}`} />
                            <span>{item.name}</span>
                          </div>
                          {item.name === 'Notifications' && unreadNotificationsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#FF6B2B] text-white">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-[#3d2a88]/15 dark:border-[#3d2a88]/30 pt-4">
                  <div className="flex items-center space-x-3 p-2 bg-[#FFF8F0]/80 dark:bg-[#2D1B69]/30 border border-[#3d2a88]/15 dark:border-[#3d2a88]/30 rounded-xl mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary-light/30 text-primary dark:text-cream flex items-center justify-center text-xs font-black border border-primary/20 dark:border-[#3d2a88]/40">
                      {adminInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{adminName}</p>
                      <p className="text-[9px] text-slate-455 dark:text-slate-500 font-bold uppercase truncate text-left">Super Administrator</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left text-xs text-rose-500 dark:text-rose-455 font-bold px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-955/20 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER / TOP NAVBAR */}
        <header className="h-16 shrink-0 bg-white/90 dark:bg-[#0f0a1e]/90 border-b border-slate-200 dark:border-[#3d2a88]/30 px-4 md:px-8 flex items-center justify-between shadow-sm relative z-30 text-slate-800 dark:text-white backdrop-blur-md">
          {/* Left spacer for mobile menu */}
          <div className="w-12 lg:hidden"></div>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-[#1a1035]/60 border border-slate-200 dark:border-[#3d2a88]/45 px-3 py-1.5 rounded-xl w-64 md:w-80">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users, franchises, inventory..."
              className="bg-transparent border-none text-xs focus:outline-none w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Right items */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Current Date */}
            <span className="hidden md:inline text-xs font-semibold text-slate-655 dark:text-slate-300 bg-slate-50 dark:bg-[#2D1B69]/50 border border-slate-200 dark:border-[#3d2a88]/30 px-3 py-1.5 rounded-xl">
              {currentDate}
            </span>

            {/* Notification bell */}
            <div className="relative z-50">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-905/30 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 transition-colors relative cursor-pointer"
              >
                <Bell size={15} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 dark:bg-orange-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1035] border border-slate-200 dark:border-[#3d2a88]/40 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-[#3d2a88]/30">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Recent Alerts</h4>
                      <Link
                        href="/dashboard/admin/notifications"
                        onClick={() => setNotificationOpen(false)}
                        className="text-[10px] text-accent dark:text-accent hover:underline font-bold"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 4).map((notif) => (
                          <Link
                            key={notif.id}
                            href="/dashboard/admin/notifications"
                            onClick={() => setNotificationOpen(false)}
                            className="block text-xs border-b border-slate-100 dark:border-[#3d2a88]/20 pb-2 last:border-0 last:pb-0 hover:bg-orange-50/50 dark:hover:bg-[#2D1B69]/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <p className={`font-bold ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>
                              {notif.title || "New Notification"}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{notif.message || notif.text}</p>
                            <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-slate-455 text-center py-4 font-semibold">No recent announcements</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={15} className="text-amber-500" />
              ) : (
                <Moon size={15} />
              )}
            </button>

            {/* Profile Avatar */}
            <Link href="/dashboard/admin" className="flex items-center gap-2 hover:opacity-90">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center text-xs shadow-sm shadow-orange-500/10">
                {adminInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {adminName}
                </p>
                <span className="text-[9px] text-slate-400 dark:text-slate-450 font-bold">online</span>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-[#f8f6ff] to-white dark:from-[#150e2a] dark:to-[#0f0a1e] text-slate-800 dark:text-slate-100">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminDataProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminDataProvider>
  );
}
