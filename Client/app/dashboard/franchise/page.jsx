"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  GraduationCap, Users, IndianRupee, Box, TrendingUp, 
  Share2, Copy, Check, Calendar, Activity, Sparkles, ChevronRight,
  CheckCircle2, Clock
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

export default function FranchiseOverview() {
  const { user } = useAuth();
  const [copiedRole, setCopiedRole] = useState("");

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
    { title: "Total Students", value: "148", subtext: "Active enrollments", icon: GraduationCap, color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-cream", trend: "+12 this month" },
    { title: "Active Teachers", value: "6", subtext: "All active roster", icon: Users, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400", trend: "Normal" },
    { title: "Pending Fees", value: "₹24,500", subtext: "8 terms pending", icon: IndianRupee, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400", trend: "Alert" },
    { title: "Abacus Stock", value: "32 Kits", subtext: "Low stock warning", icon: Box, color: "bg-rose-50 text-rose-650 dark:bg-rose-950/40 dark:text-rose-450", trend: "Re-order" }
  ];

  const recentActivity = [
    { id: "REG-104", student: "Rohan Deshmukh", type: "New Admission", amount: "₹4,500", date: "2026-06-17", status: "Paid" },
    { id: "INV-402", student: "Abacus Kit - Level 1", type: "Inventory Sale", amount: "₹600", date: "2026-06-16", status: "Paid" },
    { id: "REG-103", student: "Isha Sharma", type: "Level 2 Renewal", amount: "₹3,500", date: "2026-06-15", status: "Pending" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {getGreeting()}, <span className="gradient-text">{user?.name || "Center Admin"}</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Observe center metrics, batches, and recent hub activities below.</p>
        </div>
        <div className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-xl border border-orange-250 dark:border-orange-900/40">
          💼 Center Status: Active Node
        </div>
      </div>

      {/* Stats Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <MetricCard key={idx} {...stat} />
        ))}
      </div>

      {/* Interactive Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Quick Actions & Referrals (5 columns) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          
          {/* Quick Actions Center */}
          <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-555 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-500" />
                <span>Quick Operations</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link 
                href="/dashboard/franchise/students"
                className="p-4 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-900/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2 font-bold text-orange-700 dark:text-orange-400 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
              >
                <GraduationCap size={20} />
                <span>Students</span>
              </Link>
              <Link 
                href="/dashboard/franchise/teachers"
                className="p-4 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2 font-bold text-purple-700 dark:text-purple-400 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
              >
                <Users size={20} />
                <span>Teachers</span>
              </Link>
              <Link 
                href="/dashboard/franchise/batches"
                className="p-4 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2 font-bold text-blue-700 dark:text-blue-400 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
              >
                <Calendar size={20} />
                <span>Batches</span>
              </Link>
              <Link 
                href="/dashboard/franchise/inventory"
                className="p-4 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-250 dark:border-emerald-900/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
              >
                <Box size={20} />
                <span>Inventory</span>
              </Link>
            </div>
          </div>

          {/* Referrals & Invites */}
          <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-555 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Share2 size={14} className="text-indigo-650" />
                <span>Referrals & Invites</span>
              </h4>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Student", val: "STUDENT" },
                { name: "Teacher", val: "TEACHER" },
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

        {/* Right Column: Activity Queue Table (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <h4 className="text-xs font-black uppercase text-slate-555 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-orange-500 animate-pulse" />
              <span>Today's Hub Activity Queue</span>
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time Feed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3.5 font-bold tracking-wider">Activity ID</th>
                  <th className="pb-3.5 font-bold tracking-wider">Name / Item</th>
                  <th className="pb-3.5 font-bold tracking-wider text-center">Type</th>
                  <th className="pb-3.5 font-bold tracking-wider text-center">Date</th>
                  <th className="pb-3.5 font-bold tracking-wider text-right">Amount</th>
                  <th className="pb-3.5 font-bold tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 pr-2 font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {activity.id}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      <span className="group-hover:text-orange-500 transition-colors">{activity.student}</span>
                    </td>
                    <td className="py-3.5 text-center text-slate-500 dark:text-slate-400 font-medium">{activity.type}</td>
                    <td className="py-3.5 text-center text-slate-500 dark:text-slate-400 font-mono">{activity.date}</td>
                    <td className="py-3.5 text-right font-black text-[#2D1B69] dark:text-white font-mono">{activity.amount}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                        activity.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30"
                          : "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30"
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}