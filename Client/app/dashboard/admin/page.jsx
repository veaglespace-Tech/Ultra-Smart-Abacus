"use client";

import React from "react";
import Link from "next/link";
import { useAdminData } from "./AdminContext";

export default function AdminOverview() {
  const {
    totalStudents,
    activeFranchisesCount,
    activeTeachersCount,
    lowStockItemsCount,
    users,
    franchises
  } = useAdminData();

  return (
    <div className="space-y-6">

      {/* Info alert confirming security configurations */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10 px-5 py-4 flex items-start gap-3.5 shadow-sm dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)] animate-fade-in">
        <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-blue-900 dark:text-blue-100">
            Restricted Signup Security Policy Active
          </h4>
          <p className="text-xs text-blue-800 dark:text-slate-300 mt-1 leading-relaxed">
            Public registration has been successfully disabled. Accounts can only be created by system administrators through the <strong>User Management</strong> tab.
          </p>
        </div>
      </div>

      {/* KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Students",
            value: totalStudents.toLocaleString(),
            subtitle: "+12% this month",
            icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 017.382 5.84c-1.84.532-3.613 1.185-5.291 1.956m-8.351 0a54.12 54.12 0 018.35 0M12 10.147v-4.14",
            border: "border-blue-500/20 dark:border-blue-500/15"
          },
          {
            title: "Active Franchises",
            value: activeFranchisesCount,
            subtitle: `${franchises.length} total branches`,
            icon: "M2.25 21h19.5m-18-10.5h16.5M2.25 9h19.5M2.25 15h19.5M2.25 18h19.5M3 3h18M3 6h18",
            border: "border-amber-500/20 dark:border-amber-500/15"
          },
          {
            title: "Certified Instructors",
            value: activeTeachersCount,
            subtitle: `${users.filter(u => u.role === "Teacher").length} registered`,
            icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20",
            border: "border-rose-500/20 dark:border-rose-500/15"
          },
          {
            title: "Low Stock Items",
            value: lowStockItemsCount,
            subtitle: "Action required in inventory",
            icon: "M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z",
            border: lowStockItemsCount > 0 ? "border-rose-500/50 text-rose-600 dark:text-rose-300 animate-pulse" : "border-slate-200 dark:border-slate-500/15"
          }
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-white/[0.03] dark:shadow-md backdrop-blur-md transition-all hover:bg-slate-50/55 dark:hover:bg-white/[0.05] hover:scale-[1.02] ${stat.border}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <svg className="w-5 h-5 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono">
              {stat.value}
            </div>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold block mt-1">
              {stat.subtitle}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Logins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Quick actions panel */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide uppercase border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
            Quick Operations
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/admin/users?add=true"
              className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] text-left transition-all duration-300 cursor-pointer block"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-9 1.5h.008v.008H7.5V12zm.008 3h.008v.008H7.5v-.008zm0 3h.008v.008H7.5v-.008zM12 7.5h.008v.008H12V7.5zm.008 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Create Account</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Add teacher/student</span>
            </Link>

            <Link
              href="/dashboard/admin/franchise?add=true"
              className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] text-left transition-all duration-300 cursor-pointer block"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Add Franchise</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Approve new branch</span>
            </Link>

            <Link
              href="/dashboard/admin/inventory"
              className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] text-left transition-all duration-300 cursor-pointer block"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Check Stock</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">{lowStockItemsCount} items at alert limit</span>
            </Link>

            <Link
              href="/dashboard/admin/settings"
              className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] text-left transition-all duration-300 cursor-pointer block"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.68-.86-1.72-.4-2.59M13.66 8.16c.68.68.86 1.72.4 2.59M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Access Settings</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Toggle signups & alerts</span>
            </Link>
          </div>
        </div>

        {/* Audit trail / Recent updates log */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide uppercase border-b border-slate-100 dark:border-white/5 pb-3 mb-4 flex items-center justify-between">
            <span>Administrative Logs</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-normal font-mono">Real-time Feed</span>
          </h3>
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {[
              { action: "Registration Restricted", user: "Saideep (Admin)", details: "Public account creation disabled in configurations", time: "10 mins ago", badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" },
              { action: "Stock Adjusted", user: "Delhi Central", details: "Standard Student Abacus increased by +100 units", time: "1 hour ago", badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" },
              { action: "Account Registered", user: "Saideep (Admin)", details: "Created Franchise profile for Mumbai West Center", time: "2 hours ago", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
              { action: "Workbook Re-order Alert", user: "System", details: "Level 1 Workbooks stock fell below target limit (150)", time: "4 hours ago", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" }
            ].map((log, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs py-2.5 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-light">
                    By {log.user} • {log.details}
                  </span>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-slate-450 dark:text-slate-500">{log.time}</span>
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
