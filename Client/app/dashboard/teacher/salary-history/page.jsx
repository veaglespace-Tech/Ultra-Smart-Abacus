// src/app/dashboard/teacher/salary-history/page.jsx
"use client";
import React, { useState } from 'react';

function LocalTable({ headers, children }) {
  return (
    <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm shadow-[#4a5d4e]/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-widest text-[#7a8475]">
              {headers.map((header, idx) => <th key={idx} className="py-4 px-6">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2dcd0]/50 text-xs text-[#2c3539] font-medium">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeacherSalaryHistoryPage() {
  const [salaryLogs] = useState([
    { id: 'PAY-801', period: 'May 2026', grossAmount: '₹28,500', status: 'Disbursed', date: '2026-06-02', mode: 'Bank Transfer' },
    { id: 'PAY-702', period: 'April 2026', grossAmount: '₹26,000', status: 'Disbursed', date: '2026-05-03', mode: 'Bank Transfer' },
    { id: 'PAY-603', period: 'March 2026', grossAmount: '₹29,200', status: 'Disbursed', date: '2026-04-02', mode: 'UPI Link' }
  ]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black text-[#1a202c] tracking-tight uppercase">Remuneration Ledger</h2>
          <p className="text-[11px] text-[#8a9485] font-medium mt-0.5">Review your historical monthly salary disbursement statements and tracking records.</p>
        </div>
      </div>

      {/* SALARY LEDGER DATA ENGINE */}
      <LocalTable headers={["Status", "Statement Period", "Disbursed Value", "Settlement Node", "Reference ID"]}>
        {salaryLogs.map((log) => (
          <tr key={log.id} className="hover:bg-[#f5f2eb]/40 transition-all duration-100">
            {/* Status Indicator */}
            <td className="py-4 px-6 w-40">
              <span className="inline-block w-28 text-center py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border bg-[#4a5d4e]/10 text-[#4a5d4e] border-[#4a5d4e]/20">
                ● {log.status}
              </span>
            </td>

            {/* Billing Month */}
            <td className="py-4 px-6 font-bold text-[#1a202c] text-sm tracking-wide">
              {log.period}
            </td>

            {/* Total Cleared Remuneration */}
            <td className="py-4 px-6 font-mono font-black text-sm text-[#2c3539]">
              {log.grossAmount}
            </td>

            {/* Payment Method Details */}
            <td className="py-4 px-6 font-semibold text-[#4a5d4e]">
              <span className="text-xs block font-bold">{log.mode}</span>
              <span className="text-[9px] text-[#8a9485] font-mono">{log.date}</span>
            </td>

            {/* Unique Hash Trace */}
            <td className="py-4 px-6 font-mono text-[#8a9485] text-[11px] uppercase">
              {log.id}
            </td>
          </tr>
        ))}
      </LocalTable>

    </div>
  );
}