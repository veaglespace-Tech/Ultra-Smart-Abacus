"use client";

import React, { useState, useMemo } from "react";
import { useAdminData } from "../AdminContext";
import { 
  Building2, Users, GraduationCap, IndianRupee, TrendingUp, 
  Download, Filter, Calendar, Package, CheckCircle, Clock, 
  AlertCircle, FileSpreadsheet, BarChart3, PieChart, ArrowUpRight,
  Layers, ShieldCheck
} from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReportsPage() {
  const {
    users = [],
    franchises = [],
    inventory = [],
    totalStudents,
    activeFranchisesCount,
    activeTeachersCount,
    lowStockItemsCount,
    loading
  } = useAdminData();

  const [selectedFranchiseFilter, setSelectedFranchiseFilter] = useState("ALL");

  // 1. Filtered Franchises
  const filteredFranchises = useMemo(() => {
    if (selectedFranchiseFilter === "ALL") return franchises;
    return franchises.filter(f => f.id.toString() === selectedFranchiseFilter.toString());
  }, [franchises, selectedFranchiseFilter]);

  // 2. Aggregate all student data
  const studentUsers = useMemo(() => {
    return users.filter(u => u.role === "Student");
  }, [users]);

  // 3. Aggregate all fee records across selected franchises
  const feeAnalytics = useMemo(() => {
    const feeRecords = filteredFranchises.flatMap(f => f.rawFees || []);
    
    let totalBilled = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let partialCount = 0;

    feeRecords.forEach(fee => {
      const billed = Number(fee.totalFee || fee.amount || 0);
      const paid = Number(fee.paidAmount || 0);
      const due = Math.max(0, billed - paid);

      totalBilled += billed;
      totalCollected += paid;
      totalPending += due;

      const status = (fee.status || "").toUpperCase();
      if (status === "PAID" || due === 0) {
        paidCount++;
      } else if (paid > 0) {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    return {
      totalBilled,
      totalCollected,
      totalPending,
      paidCount,
      pendingCount,
      partialCount,
      totalCount: feeRecords.length,
      collectionRate
    };
  }, [filteredFranchises]);

  // 4. Calculate Inventory Analytics
  const inventoryAnalytics = useMemo(() => {
    const totalItems = inventory.length;
    const totalStockQuantity = inventory.reduce((acc, item) => acc + Number(item.stock || 0), 0);
    const totalValuation = inventory.reduce((acc, item) => acc + (Number(item.stock || 0) * Number(item.cost || item.price || 0)), 0);
    const lowStockCount = inventory.filter(item => Number(item.stock || 0) <= Number(item.minThreshold || 10)).length;

    return {
      totalItems,
      totalStockQuantity,
      totalValuation,
      lowStockCount
    };
  }, [inventory]);

  // 5. Calculate Monthly Student Registrations breakdown (Dynamic 12 Months)
  const monthlyRegistrations = useMemo(() => {
    const monthCounts = Array(12).fill(0);

    studentUsers.forEach(st => {
      if (!st.date && !st.createdAt) return;
      const d = new Date(st.date || st.createdAt);
      if (!isNaN(d.getTime())) {
        monthCounts[d.getMonth()] += 1;
      }
    });

    const maxCount = Math.max(...monthCounts, 1);

    return MONTH_NAMES.map((name, idx) => {
      const count = monthCounts[idx];
      const pct = Math.round((count / maxCount) * 100);
      return {
        month: name,
        count,
        pct: `${Math.max(pct, count > 0 ? 15 : 4)}%`
      };
    });
  }, [studentUsers]);

  // 6. CSV Export Function
  const exportExecutiveReportCSV = () => {
    const lines = [];
    lines.push("ACADEMY EXECUTIVE ANALYTICS REPORT");
    lines.push(`Generated Date,${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("KEY PERFORMANCE METRICS");
    lines.push(`Total Active Students,${totalStudents || studentUsers.length}`);
    lines.push(`Total Franchise Centers,${activeFranchisesCount || franchises.length}`);
    lines.push(`Total Instructors,${activeTeachersCount}`);
    lines.push(`Total Fees Billed (INR),${feeAnalytics.totalBilled}`);
    lines.push(`Total Fees Collected (INR),${feeAnalytics.totalCollected}`);
    lines.push(`Total Pending Dues (INR),${feeAnalytics.totalPending}`);
    lines.push(`Collection Rate (%),${feeAnalytics.collectionRate}%`);
    lines.push(`Inventory Valuation (INR),${inventoryAnalytics.totalValuation}`);
    lines.push("");
    lines.push("FRANCHISE PERFORMANCE MATRIX");
    lines.push("Franchise ID,Center Name,Owner,Active Students,Teachers,Batches,Fees Collected (INR),Pending Dues (INR)");
    
    filteredFranchises.forEach(f => {
      const fFees = f.rawFees || [];
      const collected = fFees.reduce((acc, fee) => acc + Number(fee.paidAmount || 0), 0);
      const billed = fFees.reduce((acc, fee) => acc + Number(fee.totalFee || fee.amount || 0), 0);
      const dues = Math.max(0, billed - collected);

      lines.push(`"F${f.id}","${f.name}","${f.owner}",${f.students || 0},${f.teachersCount || 0},${f.batchesCount || 0},${collected},${dues}`);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Academy_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">ACADEMY ACTIVITY & FINANCIAL REPORTS</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time data telemetry across regional centers, student enrollments, fee collections, and inventory assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Franchise Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedFranchiseFilter}
              onChange={(e) => setSelectedFranchiseFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Franchise Centers ({franchises.length})</option>
              {franchises.map(f => (
                <option key={f.id} value={f.id.toString()}>
                  F{f.id} - {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={exportExecutiveReportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-xs font-bold text-white shadow-md shadow-[#FF6B2B]/20 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Download size={14} /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Total Active Students */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block">Enrolled Students</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {loading ? "..." : (totalStudents || studentUsers.length)}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> Live Telemetry
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Active Franchises */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block">Regional Centers</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {loading ? "..." : (activeFranchisesCount || franchises.length)}
            </p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-1">
              <Building2 size={11} /> Registered Branches
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        {/* Total Fee Revenue Collected */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block">Fees Collected</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              ₹{feeAnalytics.totalCollected.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 block">
              Billed: ₹{feeAnalytics.totalBilled.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Inventory Stock Asset Valuation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block">Inventory Valuation</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₹{inventoryAnalytics.totalValuation.toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <Package size={11} /> {inventoryAnalytics.totalItems} Items ({inventoryAnalytics.lowStockCount} Low)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

      </div>

      {/* Analytics Charts & Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Registrations Dynamic Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  New Student Registrations (Monthly Breakdown)
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Calculated from registered student profiles.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <BarChart3 size={12} /> Live Breakdown
              </span>
            </div>

            <div className="space-y-3.5">
              {monthlyRegistrations.map((bar, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{bar.month}</span>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div 
                      style={{ width: bar.pct }}
                      className="h-full bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-mono font-bold text-slate-900 dark:text-white">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Registered Students: <strong>{studentUsers.length}</strong></span>
            <span>Instructors Count: <strong>{activeTeachersCount}</strong></span>
          </div>
        </div>

        {/* Financial Health & Fee Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Fee Collection & Financial Health
              </h4>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <PieChart size={12} /> {feeAnalytics.collectionRate}% Collected
              </span>
            </div>

            {/* Collection Progress Bar */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Fee Recovery Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{feeAnalytics.totalCollected.toLocaleString()} / ₹{feeAnalytics.totalBilled.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${feeAnalytics.collectionRate}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> Total Paid Collections
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{feeAnalytics.totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" /> Outstanding Pending Dues
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">₹{feeAnalytics.totalPending.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Package size={14} className="text-purple-500" /> Total Material Inventory Assets
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">₹{inventoryAnalytics.totalValuation.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Total Gross Billed Volume</span>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 font-mono mt-0.5">
                ₹{feeAnalytics.totalBilled.toLocaleString()}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={12} /> Audit Verified
            </span>
          </div>
        </div>

      </div>

      {/* Regional Franchise Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Regional Franchise Center Performance Matrix
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Comparative telemetry breakdown across active branches.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {filteredFranchises.length} Branch{filteredFranchises.length === 1 ? "" : "es"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Center Details</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-center">Active Students</th>
                <th className="py-3 px-4 text-center">Teachers</th>
                <th className="py-3 px-4 text-center">Batches</th>
                <th className="py-3 px-4 text-right">Collected Fees</th>
                <th className="py-3 px-4 text-right">Pending Dues</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredFranchises.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No regional franchise centers found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredFranchises.map((f) => {
                  const fFees = f.rawFees || [];
                  const collected = fFees.reduce((acc, fee) => acc + Number(fee.paidAmount || 0), 0);
                  const billed = fFees.reduce((acc, fee) => acc + Number(fee.totalFee || fee.amount || 0), 0);
                  const dues = Math.max(0, billed - collected);

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono flex items-center justify-center font-bold">
                          F{f.id}
                        </span>
                        {f.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-bold">{f.owner}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{f.students || 0}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-400">{f.teachersCount || 0}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-400">{f.batchesCount || 0}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{collected.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">₹{dues.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          f.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                        }`}>
                          {f.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
