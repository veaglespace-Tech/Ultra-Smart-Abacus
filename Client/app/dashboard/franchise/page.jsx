"use client";

import React from "react";
import { GraduationCap, Users, IndianRupee, Box, TrendingUp } from "lucide-react";

export default function FranchiseOverview() {
  
  const stats = [
    { title: "Total Students", count: "148", change: "+12 this month", icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Active Teachers", count: "6", change: "All active roster", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Pending Fees", count: "₹24,500", change: "8 terms pending", icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Abacus Stock", count: "32 Kits", change: "Low stock warning", icon: Box, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const recentActivity = [
    { id: "REG-104", student: "Rohan Deshmukh", type: "New Admission", amount: "₹4,500", date: "2026-06-17", status: "Paid" },
    { id: "INV-402", student: "Abacus Kit - Level 1", type: "Inventory Sale", amount: "₹600", date: "2026-06-16", status: "Paid" },
    { id: "REG-103", student: "Isha Sharma", type: "Level 2 Renewal", amount: "₹3,500", date: "2026-06-15", status: "Pending" },
  ];

  return (
    <div className="space-y-6 w-full text-slate-800">

      {/* Welcome Banner like Teacher Console */}
      <div className="bg-white/40 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Welcome Back, Center Admin
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Here is a quick telemetry slice of your Smart Abacus franchise node for today.
        </p>
      </div>

      {/* Stats Tiles Grid with Sleek Minimal Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all duration-200">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {stat.count}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <span className="text-emerald-500 font-bold">{stat.change}</span>
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Today's Hub Activity Queue
          </h3>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Activity ID</th>
                  <th className="py-3.5 px-5">Description / Name</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-indigo-600 font-bold">
                      {activity.id}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {activity.student}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
                      {activity.type}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      {activity.date}
                    </td>
                    <td className="py-3.5 px-5 font-black text-slate-900 font-mono">
                      {activity.amount}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                        activity.status === "Paid"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
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