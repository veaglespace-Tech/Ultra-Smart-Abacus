// src/app/dashboard/teacher/payments/page.jsx
"use client";

import React, { useState } from 'react';
import { CreditCard, DollarSign, Calendar, CalendarCheck2, CheckCircle2, TrendingUp } from 'lucide-react';

export default function TeacherPaymentsPage() {
  const [payments] = useState([
    { id: 'PAY-1001', month: 'June 2026', classes: 24, amount: 3200, date: '2026-06-30', status: 'Paid', method: 'Direct Deposit' },
    { id: 'PAY-1002', month: 'May 2026', classes: 22, amount: 3000, date: '2026-05-31', status: 'Paid', method: 'Direct Deposit' },
    { id: 'PAY-1003', month: 'April 2026', classes: 26, amount: 3400, date: '2026-04-30', status: 'Paid', method: 'Direct Deposit' },
    { id: 'PAY-1004', month: 'March 2026', classes: 20, amount: 2800, date: '2026-03-31', status: 'Paid', method: 'Direct Deposit' }
  ]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">SALARY & PAYMENTS LOGS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Observe current payroll details, conducted classes counts, and salary history.</p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Current Salary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Monthly Salary</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">$3,200</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Full payout calculated</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Classes Conducted */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Classes Conducted</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">24 Classes</h3>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-medium">Goal achieved: 100%</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <CalendarCheck2 size={18} />
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Payment Status</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight">Processed</h3>
            <p className="text-[11px] text-slate-550 dark:text-slate-405 font-medium">To: Primary Bank Acc</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Last Payday */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Last Payment Date</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">June 30, 2026</h3>
            <p className="text-[11px] text-slate-550 dark:text-slate-405 font-medium">Frequency: Monthly</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Calendar size={18} />
          </div>
        </div>

      </div>

      {/* HISTORICAL STATS TABLE */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Salary Disbursal Ledger</h4>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                  <th className="py-4 px-6">Disbursal Reference</th>
                  <th className="py-4 px-6">Payment Month</th>
                  <th className="py-4 px-6">Classes Logged</th>
                  <th className="py-4 px-6">Transferred Sum</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">{p.id}</td>
                    <td className="py-4 px-6 text-slate-900 dark:text-slate-50 font-bold">{p.month}</td>
                    <td className="py-4 px-6 text-slate-650 dark:text-slate-300 font-mono font-bold">{p.classes} Sessions</td>
                    <td className="py-4 px-6 font-mono font-black text-indigo-650 dark:text-indigo-400">${p.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{p.method}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
                        {p.status}
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
