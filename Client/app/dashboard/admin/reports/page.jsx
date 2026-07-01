"use client";

import React from "react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <h3 className="text-sm font-bold text-white">Academy Activity & Financial Reports</h3>
        <p className="text-[10px] text-slate-400 font-light mt-0.5">Statistical metrics representing monthly center additions and workbook orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Registrations Chart */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            New Student Registrations (Monthly)
          </h4>
          <div className="space-y-4">
            {[
              { month: "Jan", count: 120, pct: "40%" },
              { month: "Feb", count: 155, pct: "51%" },
              { month: "Mar", count: 210, pct: "70%" },
              { month: "Apr", count: 280, pct: "93%" },
              { month: "May", count: 300, pct: "100%" }
            ].map((bar, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-10 text-xs font-mono font-medium text-slate-400">{bar.month}</span>
                <div className="flex-1 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    style={{ width: bar.pct }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  />
                </div>
                <span className="w-12 text-right text-xs font-mono font-bold text-white">{bar.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial overview */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
              Fee Collection & Financial Health
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <span className="text-slate-400">Total Franchise Royalties (YTD)</span>
                <span className="font-bold text-white font-mono">$18,450.00</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <span className="text-slate-400">Workbook Material Sales</span>
                <span className="font-bold text-white font-mono">$12,890.00</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <span className="text-slate-400">Pending Center Invoice Dues</span>
                <span className="font-bold text-amber-400 font-mono">$3,420.00</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Estimated Monthly Revenue</span>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono mt-0.5">$31,340.00</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              Audit Approved
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
