"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  IndianRupee, Search, CreditCard, ArrowDownLeft, CheckCircle, 
  Clock, AlertCircle, Filter, Download, Plus, X, Calendar, User, Loader2
} from "lucide-react";
import { api } from "@/services/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const toSafeIsoDate = (...dates) => {
  for (const dVal of dates) {
    if (dVal) {
      const d = new Date(dVal);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }
  return new Date().toISOString().split('T')[0];
};

export default function PaymentsManagement() {
  const [payments, setPayments] = useState([]);
  const [feesList, setFeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [formError, setFormError] = useState("");

  // Form State for Recording New Payment Entry
  const [formData, setFormData] = useState({
    feeId: "",
    studentName: "", 
    amount: "", 
    mode: "UPI", 
    status: "Success",
    referenceNumber: ""
  });

  // Fetch real payment transactions & salary payouts from backend
  const fetchPaymentsData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [feesRes, salaryRes] = await Promise.all([
        api.franchise.getFees().catch(() => null),
        api.salary.getHistory().catch(() => null)
      ]);

      const extractedPayments = [];

      // 1. Process Fee Collections (Inbound Inflow)
      if (feesRes && feesRes.success) {
        const feesData = feesRes.data || [];
        setFeesList(feesData);

        feesData.forEach((fee) => {
          const studentName = fee.student?.name || `Student #${fee.studentId}`;
          if (fee.payments && fee.payments.length > 0) {
            fee.payments.forEach((p) => {
              extractedPayments.push({
                id: p.receiptNumber || `REC-${p.id}`,
                invoiceId: `INV-${fee.id}`,
                feeId: fee.id,
                name: studentName,
                type: "Fee Collection",
                amount: Number(p.amount || 0),
                mode: p.paymentMode || "UPI",
                status: "Success",
                date: toSafeIsoDate(p.paymentDate, p.createdAt),
                isIncome: true
              });
            });
          } else if (Number(fee.paidAmount) > 0) {
            extractedPayments.push({
              id: `REC-${fee.id}-INIT`,
              invoiceId: `INV-${fee.id}`,
              feeId: fee.id,
              name: studentName,
              type: "Fee Collection",
              amount: Number(fee.paidAmount),
              mode: "Cash / Direct",
              status: "Success",
              date: toSafeIsoDate(fee.createdAt, fee.updatedAt),
              isIncome: true
            });
          }
        });
      }

      // 2. Process Salary Disbursals (Outbound Outflow)
      if (salaryRes && salaryRes.success) {
        const salaryData = salaryRes.data || [];
        salaryData.forEach((sal) => {
          if (sal.paymentStatus === "PAID" || sal.netSalary > 0) {
            const monthName = MONTHS[sal.month - 1] || sal.month;
            const teacherName = sal.teacher?.name || sal.teacherName || `Teacher #${sal.teacherId}`;
            const salDate = toSafeIsoDate(sal.paymentDate, sal.createdAt, sal.updatedAt);
            
            extractedPayments.push({
              id: sal.referenceNumber || `SAL-${sal.id}`,
              invoiceId: `SALARY-${monthName.substring(0,3).toUpperCase()}-${sal.year}`,
              feeId: null,
              name: teacherName,
              type: "Salary Disbursal",
              amount: Number(sal.netSalary || sal.basicSalary || 0),
              mode: sal.paymentMode || "Bank Transfer",
              status: sal.paymentStatus === "PAID" ? "Success" : "Pending",
              date: salDate,
              isIncome: false
            });
          }
        });
      }

      // Sort by date descending
      extractedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPayments(extractedPayments);
    } catch (err) {
      console.error("Failed to load payments & salary logs:", err);
      setErrorMessage(err.message || "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  // Live Metrics Calculation
  const metrics = useMemo(() => {
    const feeIncome = payments.filter(p => p.isIncome && p.status === "Success").reduce((acc, p) => acc + p.amount, 0);
    const salaryOutflow = payments.filter(p => !p.isIncome && p.status === "Success").reduce((acc, p) => acc + p.amount, 0);
    return {
      feeIncome,
      salaryOutflow,
      count: payments.length
    };
  }, [payments]);

  // Filter Pipeline
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.invoiceId || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === "All" || (p.mode || '').toLowerCase().includes(filterMode.toLowerCase());
      const matchesCategory = filterCategory === "All" || 
                              (filterCategory === "Fees" && p.type === "Fee Collection") || 
                              (filterCategory === "Salaries" && p.type === "Salary Disbursal");
      return matchesSearch && matchesMode && matchesCategory;
    });
  }, [payments, searchQuery, filterMode, filterCategory]);

  // 📥 Native Chrome Excel/CSV Download Engine
  const downloadPaymentsExcel = () => {
    const headers = ["Transaction ID", "Category", "Invoice / Ref", "Party Name", "Payment Mode", "Settled Amount (₹)", "Settlement Date", "Status"];
    
    const rows = filteredPayments.map(p => [
      p.id,
      p.type,
      p.invoiceId,
      `"${p.name}"`,
      p.mode,
      p.isIncome ? p.amount : -p.amount,
      p.date,
      p.status
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payments_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setFormError("");

    const payAmount = Number(formData.amount);
    if (!formData.amount || payAmount <= 0) {
      setFormError("Please enter a valid payment amount greater than ₹0.");
      return;
    }

    if (formData.feeId) {
      const selectedFee = feesList.find(f => String(f.id) === String(formData.feeId));
      if (selectedFee) {
        const remainingDue = Number(selectedFee.dueAmount || 0);
        if (remainingDue <= 0) {
          setFormError(`Invoice INV-${selectedFee.id} is already fully paid (Remaining due: ₹0).`);
          return;
        }
        if (payAmount > remainingDue) {
          setFormError(`Payment amount (₹${payAmount}) exceeds remaining due amount (₹${remainingDue}).`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      if (formData.feeId) {
        await api.franchise.recordPayment(formData.feeId, {
          amount: payAmount,
          paymentMode: formData.mode,
          referenceNumber: formData.referenceNumber || `REF-${Date.now()}`,
          notes: `Recorded manually via Payment Gateway Ledger`
        });
        await fetchPaymentsData();
      } else {
        const newTxn = {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          studentName: formData.studentName || "Direct Deposit Student",
          invoiceId: "DIRECT-DEPOSIT",
          amount: payAmount,
          mode: formData.mode,
          status: formData.status,
          date: new Date().toISOString().split('T')[0]
        };
        setPayments([newTxn, ...payments]);
      }

      setIsRecordOpen(false);
      setFormData({ feeId: "", studentName: "", amount: "", mode: "UPI", status: "Success", referenceNumber: "" });
    } catch (err) {
      console.error("Record payment error:", err);
      setFormError(err.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto bg-white dark:bg-slate-950 font-sans min-h-screen">
      
      {/* Top Banner Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">PAYMENT GATEWAY LEDGER</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Audit inbound cashflows, track direct UPI transfers, and manage manual cheque clears.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Chrome-friendly Download Action Button */}
          <button 
            onClick={downloadPaymentsExcel} 
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Download size={14} className="text-slate-550" /><span>Download Payments Excel</span>
          </button>
          <button 
            onClick={() => setIsRecordOpen(true)} 
            className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine"
          >
            <Plus size={14} /><span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Roster Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">Fee Collections (Inflow)</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{metrics.feeIncome.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl"><CheckCircle size={18} /></div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-700 dark:text-purple-400 font-bold">Salary Disbursals (Outflow)</div>
            <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">₹{metrics.salaryOutflow.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 rounded-xl"><IndianRupee size={18} /></div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 font-bold">Total Recorded Transactions</div>
            <div className="text-xl font-black text-blue-900 dark:text-blue-300 mt-1">{metrics.count} Logs</div>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-400 rounded-xl"><ArrowDownLeft size={18} /></div>
        </div>
      </div>

      {/* Filters Search Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 text-slate-400" size={14} />
          <input type="text" placeholder="Search Txn ID, Party, Ref..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400" />
        </div>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none w-full sm:w-44 focus:border-indigo-500 cursor-pointer">
          <option value="All">All Categories</option>
          <option value="Fees">Fee Collections (Students)</option>
          <option value="Salaries">Salary Payouts (Teachers)</option>
        </select>

        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none w-full sm:w-44 sm:ml-auto focus:border-indigo-500 cursor-pointer">
          <option value="All">All Payment Modes</option>
          <option value="UPI">UPI (GPay/PhonePe)</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cash">Cash Deposits</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      {/* Main Core Roster Data Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Invoice / Ref</th>
                <th className="py-4 px-6">Party Name</th>
                <th className="py-4 px-6">Payment Instrument</th>
                <th className="py-4 px-6 font-mono text-right">Amount (₹)</th>
                <th className="py-4 px-6 text-center">Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-indigo-500" size={18} />
                      <span>Loading payment & salary transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    No payment transactions recorded matching filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{p.id}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono border ${
                        p.isIncome 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" 
                          : "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900"
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 dark:text-slate-400">{p.invoiceId}</td>
                    <td className="py-4 px-6 font-black text-slate-900 dark:text-white">
                      {p.name}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans">{p.isIncome ? "Student" : "Teacher / Staff"}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <CreditCard size={13} className="text-slate-500" /> {p.mode}
                      </span>
                    </td>
                    <td className={`py-4 px-6 font-mono text-right font-black text-sm ${p.isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {p.isIncome ? `+₹${p.amount.toLocaleString()}` : `-₹${p.amount.toLocaleString()}`}
                    </td>
                    <td className="py-4 px-6 font-mono text-center text-slate-500 dark:text-slate-400">{p.date}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        p.status === "Success" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900" :
                        "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Entry Record Popup Form */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-xl relative text-slate-800 dark:text-slate-100">
            <button onClick={() => setIsRecordOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"><X size={16} /></button>
            <h3 className="text-xs font-black text-slate-900 dark:text-white mb-5 uppercase font-mono tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Log Manual Payment Entry</h3>
            
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {feesList.length > 0 && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Select Student / Fee Invoice</label>
                  <select 
                    value={formData.feeId} 
                    onChange={(e) => {
                      setFormError("");
                      const selectedFee = feesList.find(f => String(f.id) === e.target.value);
                      const due = selectedFee ? Number(selectedFee.dueAmount || 0) : 0;
                      setFormData({
                        ...formData, 
                        feeId: e.target.value,
                        amount: due > 0 ? due.toString() : "",
                        studentName: selectedFee ? (selectedFee.student?.name || `Student #${selectedFee.studentId}`) : formData.studentName
                      });
                    }} 
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">-- Direct Payment (No linked Fee ID) --</option>
                    {feesList.map((fee) => (
                      <option key={fee.id} value={fee.id}>
                        INV-{fee.id} - {fee.student?.name || `Student #${fee.studentId}`} (Due: ₹{fee.dueAmount || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Payer Student Name</label>
                <input type="text" required placeholder="e.g. Rahul Patil" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Reference Number</label>
                  <input type="text" placeholder="e.g. UPI-19827391" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Collected Gross (₹)</label>
                  <input type="number" required placeholder="5310" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Payment Instrument</label>
                  <select value={formData.mode} onChange={(e) => setFormData({...formData, mode: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer">
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque Instrument</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Clearance Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer">
                    <option value="Success">Success (Settled)</option>
                    <option value="Pending">Pending (In-clearance)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button type="button" onClick={() => setIsRecordOpen(false)} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50">
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <IndianRupee size={14} />}
                  <span>{submitting ? "Processing..." : "Commit Transaction"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}