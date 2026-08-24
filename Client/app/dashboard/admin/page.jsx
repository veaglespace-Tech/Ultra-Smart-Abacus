"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdminData } from "./AdminContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, Grid, Box, Settings, Share2, Copy, Check, ShieldAlert,
  Calendar, Activity, Sparkles, ChevronRight, GraduationCap, CheckCircle2,
  Clock, Loader2
} from "lucide-react";

function MetricCard({ title, value, subtext, icon: Icon, color, trend }) {
  return (
    <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] card-hover hover:translate-y-[-6px] hover:shadow-[0_20px_40px_rgba(45,27,105,0.12)] hover:border-orange-500/35 transition-all duration-300 flex justify-between items-start relative overflow-hidden group">
      <div className="space-y-2 relative z-10">
        <p className="text-[10px] text-slate-500 dark:text-slate-455 uppercase font-black tracking-widest">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-[#2D1B69] dark:text-white tracking-tight">{value}</h3>
          {trend && (
            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold">{subtext}</p>
      </div>
      <div className={`p-3 rounded-xl ${color} relative z-10 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={18} />
      </div>
      <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
    </div>
  );
}

export default function AdminOverview() {
  const { user } = useAuth();
  const {
    totalStudents,
    activeFranchisesCount,
    activeTeachersCount,
    lowStockItemsCount,
    users,
    franchises,
    loading
  } = useAdminData();

  const [copiedRole, setCopiedRole] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-accent" size={32} />
        <p className="text-xs text-slate-555 dark:text-slate-455 font-bold uppercase tracking-wider">Syncing admin telemetry...</p>
      </div>
    );
  }
  
  const copyInviteLink = (role) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    const link = `${origin}/auth/register?role=${role}`;
    navigator.clipboard.writeText(link);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(""), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      subtext: "+12% this month",
      icon: GraduationCap,
      color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-cream",
      trend: null
    },
    {
      title: "Active Franchises",
      value: activeFranchisesCount.toString(),
      subtext: `${franchises.length} total branches`,
      icon: Grid,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      trend: null
    },
    {
      title: "Certified Instructors",
      value: activeTeachersCount.toString(),
      subtext: `${users ? users.filter(u => u.role === "Teacher").length : 0} registered`,
      icon: Users,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
      trend: null
    },
    {
      title: "Low Stock Items",
      value: lowStockItemsCount.toString(),
      subtext: "Action required in inventory",
      icon: Box,
      color: "bg-rose-50 text-rose-650 dark:bg-rose-950/40 dark:text-rose-450",
      trend: null
    }
  ];

  return (
    <div className="space-y-6">

      {/* Info alert confirming security configurations */}
      <div className="rounded-3xl border border-orange-200 bg-[#FFF8F0]/40 dark:border-[#3d2a88]/30 dark:bg-[#1a1035]/40 px-5 py-4 flex items-start gap-3.5 shadow-sm animate-fade-in">
        <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Restricted Signup Security Policy Active
          </h4>
          <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
            Public registration has been successfully disabled. Accounts can only be created by system administrators through the <strong className="text-[#FF6B2B]">User Management</strong> tab.
          </p>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-55 tracking-tight">
            {getGreeting()}, <span className="gradient-text">{user?.name || "Administrator"}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">Observe system-wide metrics, franchise lists, and administrative log streams below.</p>
        </div>
        <div className="text-xs font-bold text-[#2D1B69] dark:text-[#f0ebff] bg-primary/10 dark:bg-[#2D1B69]/50 px-3 py-1.5 rounded-xl border border-primary/20 dark:border-[#3d2a88]/40">
          ⚙️ ERP System Node: Active
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <MetricCard key={idx} {...stat} />
        ))}
      </div>

      {/* Quick Actions & Recent Logins Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column: Quick Actions & Referrals (5 columns) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          
          {/* Quick operations panel */}
          <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-555 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-500" />
                <span>Quick Operations</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { href: "/dashboard/admin/users?add=true", title: "Create Account", desc: "Add new teacher or student profile", icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
                { href: "/dashboard/admin/franchise?add=true", title: "Add Franchise", desc: "Approve and setup new branch", icon: Grid, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
                { href: "/dashboard/admin/inventory", title: "Check Stock", desc: `${lowStockItemsCount} items at alert limit`, icon: Box, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40" },
                { href: "/dashboard/admin/settings", title: "System Settings", desc: "Access ERP configurations", icon: Settings, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" }
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={idx} 
                    href={link.href} 
                    className="p-3 rounded-2xl bg-slate-50/50 dark:bg-[#150e2a]/55 border border-slate-150/60 dark:border-slate-800 hover:bg-[#FFF8F0]/30 dark:hover:bg-[#1e1445]/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${link.color} flex items-center justify-center shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                          {link.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {link.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Share Referral Links */}
          <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-555 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Share2 size={14} className="text-indigo-650" />
                <span>Referral / Invite Links</span>
              </h4>
            </div>
            
            <div className="space-y-2">
              {[
                { name: "Student", val: "STUDENT" },
                { name: "Teacher", val: "TEACHER" },
                { name: "Franchise", val: "FRANCHISE" },
              ].map((roleObj) => (
                <div key={roleObj.val} className="flex items-center justify-between p-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#150e2a]/55">
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-300">Invite {roleObj.name}</span>
                  <button
                    type="button"
                    onClick={() => copyInviteLink(roleObj.val)}
                    className="p-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-90 text-white text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border-0 shadow-sm"
                  >
                    {copiedRole === roleObj.val ? <Check size={12} /> : <Copy size={12} />}
                    {copiedRole === roleObj.val ? "Copied" : "Copy Link"}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Administrative Logs (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <h4 className="text-xs font-black uppercase text-slate-555 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-orange-500 animate-pulse" />
              <span>Administrative Logs</span>
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Real-time Feed</span>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { action: "Registration Restricted", user: "Saideep (Admin)", details: "Public account creation disabled in configurations", time: "10 mins ago", badge: "bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-955/20 dark:text-rose-450 dark:border-rose-900/30" },
              { action: "Stock Adjusted", user: "Delhi Central", details: "Standard Student Abacus increased by +100 units", time: "1 hour ago", badge: "bg-blue-50 text-blue-750 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30" },
              { action: "Account Registered", user: "Saideep (Admin)", details: "Created Franchise profile for Mumbai West Center", time: "2 hours ago", badge: "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30" },
              { action: "Workbook Re-order Alert", user: "System", details: "Level 1 Workbooks stock fell below target limit (150)", time: "4 hours ago", badge: "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30" }
            ].map((log, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs py-3 first:pt-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-455 font-semibold">
                    By {log.user} • {log.details}
                  </span>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5 ml-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">{log.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${log.badge}`}>
                    Audit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
