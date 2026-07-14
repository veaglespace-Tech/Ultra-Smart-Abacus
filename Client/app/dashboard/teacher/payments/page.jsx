"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  IndianRupee, Calendar, CheckCircle2, AlertCircle, FileText, Download, Search, Clock
} from "lucide-react";
import { api } from "@/services/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function TeacherPaymentsPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSalaryHistory = async () => {
    setLoading(true);
    try {
      const res = await api.salary.getMyHistory();
      if (res.success) {
        setSalaries(res.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to retrieve salary statement logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryHistory();
  }, []);

  // Compute stats based on real database records
  const metrics = useMemo(() => {
    if (salaries.length === 0) {
      return {
        currentMonthSalary: "₹0",
        currentMonthStatus: "Awaiting Record",
        lastPaymentDate: "N/A",
        totalDisbursed: "₹0"
      };
    }

    const latest = salaries[0]; // ordered by date desc
    const totalPaidSum = salaries
      .filter(s => s.paymentStatus === "PAID")
      .reduce((acc, s) => acc + s.netSalary, 0);

    const lastPaidSalary = salaries.find(s => s.paymentStatus === "PAID");

    return {
      currentMonthSalary: `₹${latest.netSalary.toLocaleString()}`,
      currentMonthStatus: latest.paymentStatus,
      lastPaymentDate: lastPaidSalary?.paymentDate 
        ? new Date(lastPaidSalary.paymentDate).toLocaleDateString() 
        : "N/A",
      totalDisbursed: `₹${totalPaidSum.toLocaleString()}`
    };
  }, [salaries]);

  // Search Filter
  const filteredSalaries = useMemo(() => {
    return salaries.filter(s => {
      const monthName = MONTHS[s.month - 1].toLowerCase();
      const yearString = s.year.toString();
      const status = s.paymentStatus.toLowerCase();
      const reference = (s.referenceNumber || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      return monthName.includes(query) || 
             yearString.includes(query) || 
             status.includes(query) || 
             reference.includes(query);
    });
  }, [salaries, searchQuery]);

  // CSV Export for Teacher Ledger
  const handleExportLedgerCSV = () => {
    const headers = ["Period", "Basic Salary (INR)", "Bonus (INR)", "Deductions (INR)", "Net Salary (INR)", "Status", "Payment Date", "Payment Mode", "Ref/Txn No"];
    const rows = filteredSalaries.map(s => [
      `"${MONTHS[s.month - 1]} ${s.year}"`,
      s.basicSalary,
      s.bonus,
      s.deductions,
      s.netSalary,
      s.paymentStatus,
      s.paymentDate ? s.paymentDate.split("T")[0] : "N/A",
      s.paymentMode || "N/A",
      s.referenceNumber || "N/A"
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Salary_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Slip Printing View
  const triggerPrintSlip = (salary) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Salary Slip - ${salary.teacher?.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .container { border: 2px solid #ddd; padding: 30px; border-radius: 12px; max-width: 700px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #1a202c; padding-bottom: 20px; }
            .logo { font-size: 22px; font-weight: 900; color: #4f46e5; letter-spacing: 1px; }
            .subtitle { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; margin-top: 5px; }
            .title { font-size: 18px; font-weight: bold; margin-top: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px; font-size: 13px; border-bottom: 1px solid #edf2f7; padding-bottom: 20px; }
            .info-item { display: flex; justify-content: space-between; padding-right: 20px; }
            .info-label { color: #718096; font-weight: 600; }
            .info-value { font-weight: bold; color: #2d3748; }
            .salary-table { w-full; width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 14px; }
            .salary-table th { background-color: #f7fafc; text-align: left; padding: 10px; border-bottom: 2px solid #edf2f7; color: #718096; }
            .salary-table td { padding: 12px 10px; border-bottom: 1px solid #edf2f7; }
            .total-row { font-weight: bold; background-color: #f8fafc; font-size: 15px; }
            .footer { margin-top: 50px; font-size: 12px; border-top: 1px solid #edf2f7; padding-top: 20px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-box { border-top: 1px dashed #cbd5e0; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; font-weight: bold; color: #4a5568; }
            @media print {
              body { padding: 0; }
              .container { border: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="container">
            <div class="header">
              <div class="logo">SMART ABACUS</div>
              <div class="subtitle">Official Remuneration Statement</div>
              <div class="title">Payslip for ${MONTHS[salary.month - 1]} ${salary.year}</div>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Employee Name:</span>
                <span class="info-value">${salary.teacher?.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Franchise Center:</span>
                <span class="info-value">${salary.franchise?.name || "Main Branch"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employee ID:</span>
                <span class="info-value">EMP-${salary.teacher?.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Statement Date:</span>
                <span class="info-value">${new Date(salary.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <table class="salary-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style="text-align: right; font-weight: bold;">₹${salary.basicSalary.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Additions (Bonus / Incentives)</td>
                  <td style="text-align: right; color: #2f855a;">+ ₹${salary.bonus.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Deductions (Taxes / Leaves)</td>
                  <td style="text-align: right; color: #c53030;">- ₹${salary.deductions.toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td>Net Remuneration Disbursed</td>
                  <td style="text-align: right; color: #4f46e5; font-size: 16px;">₹${salary.netSalary.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="info-grid" style="margin-top: 30px; border-bottom: none;">
              <div class="info-item">
                <span class="info-label">Payment Status:</span>
                <span class="info-value" style="color: ${salary.paymentStatus === 'PAID' ? '#2f855a' : '#dd6b20'};">${salary.paymentStatus}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Settlement Mode:</span>
                <span class="info-value">${salary.paymentMode || "Pending"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Date:</span>
                <span class="info-value">${salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString() : "Pending"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Reference ID / Txn Hash:</span>
                <span class="info-value" style="font-family: monospace; font-size: 11px;">${salary.referenceNumber || "N/A"}</span>
              </div>
            </div>

            <div class="footer">
              <p><strong>Remarks:</strong> ${salary.remarks || "No remarks annotated for this billing cycle."}</p>
              <div class="signatures">
                <div class="signature-box">Recipient Signature</div>
                <div class="signature-box">Authorized Signature</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black tracking-tight uppercase">SALARY & PAYMENTS LOGS</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Observe current payroll details, disbursal modes, and download monthly statements.</p>
        </div>
        <button 
          onClick={handleExportLedgerCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black shadow-sm hover:bg-slate-55/60 transition cursor-pointer self-start"
        >
          <Download size={14} /> Export Statement CSV
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold">
          <AlertCircle size={16} /> <span>{errorMsg}</span>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Latest Salary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Latest Payout</p>
            <h3 className="text-2xl font-black tracking-tight">{metrics.currentMonthSalary}</h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
              <span>Status: {metrics.currentMonthStatus}</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <IndianRupee size={18} />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Status of Latest Payout</p>
            <h3 className={`text-2xl font-black tracking-tight ${metrics.currentMonthStatus === "PAID" ? "text-emerald-600 dark:text-emerald-450" : "text-amber-600 dark:text-amber-450"}`}>
              {metrics.currentMonthStatus}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Updated automatically</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Aggregate Disbursed Amount</p>
            <h3 className="text-2xl font-black tracking-tight">{metrics.totalDisbursed}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Sum of all PAID periods</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <IndianRupee size={18} />
          </div>
        </div>

        {/* Last Payday */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Last Payout Settled On</p>
            <h3 className="text-xl font-black tracking-tight">{metrics.lastPaymentDate}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Frequency: Monthly</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Calendar size={18} />
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by period, status, or reference number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-650/15"
          />
        </div>
      </div>

      {/* HISTORICAL STATS TABLE */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Salary Disbursal Ledger</h4>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-450">Loading salary ledger...</div>
            ) : filteredSalaries.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-450">No salary records found matching filters.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <th className="py-4 px-6">Billing Period</th>
                    <th className="py-4 px-6">Basic Salary</th>
                    <th className="py-4 px-6">Additions / Deductions</th>
                    <th className="py-4 px-6">Transferred Sum</th>
                    <th className="py-4 px-6">Settlement Node</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  {filteredSalaries.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-100">
                      <td className="py-4 px-6 font-black text-slate-900 dark:text-slate-50">
                        {MONTHS[s.month - 1]} {s.year}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        ₹{s.basicSalary.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="text-emerald-600">Bonus: +₹{s.bonus.toLocaleString()}</p>
                        <p className="text-rose-500">Ded: -₹{s.deductions.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-6 font-black text-indigo-650 dark:text-indigo-400">
                        ₹{s.netSalary.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-450 space-y-0.5">
                        {s.paymentStatus === "PAID" ? (
                          <>
                            <p className="font-bold">{s.paymentMode}</p>
                            <p className="text-[10px] font-mono">{s.referenceNumber || "No reference ID"}</p>
                            <p className="text-[9px] text-slate-400">{new Date(s.paymentDate).toLocaleDateString()}</p>
                          </>
                        ) : (
                          <p className="italic text-slate-400">Pending clearance</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black border uppercase ${
                          s.paymentStatus === "PAID" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" 
                            : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                        }`}>
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => triggerPrintSlip(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-900 transition-all cursor-pointer"
                        >
                          <FileText size={12} /> Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
