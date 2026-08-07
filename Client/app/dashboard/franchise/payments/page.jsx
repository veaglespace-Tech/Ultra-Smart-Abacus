"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  IndianRupee, Search, CreditCard, ArrowDownLeft, CheckCircle, 
  Clock, AlertCircle, Filter, Download, Plus, X, Calendar, User, Loader2
} from "lucide-react";
import { api } from "@/services/api";

export default function PaymentsManagement() {
  const [payments, setPayments] = useState([]);
  const [feesList, setFeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("All");

  // Form State for Recording New Payment Entry
  const [formData, setFormData] = useState({
    feeId: "",
    studentName: "", 
    amount: "", 
    mode: "UPI (GPay)", 
    status: "Success",
    referenceNumber: ""
  });

  // Fetch real payment transactions from backend
  const fetchPaymentsData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.franchise.getFees();
      if (res && res.success) {
        const feesData = res.data || [];
        setFeesList(feesData);

        const extractedPayments = [];
        feesData.forEach((fee) => {
          const studentName = fee.student?.name || `Student #${fee.studentId}`;
          if (fee.payments && fee.payments.length > 0) {
            fee.payments.forEach((p) => {
              extractedPayments.push({
                id: p.receiptNumber || `TXN-${p.id}`,
                invoiceId: `INV-${fee.id}`,
                feeId: fee.id,
                studentName,
                amount: Number(p.amount || 0),
                mode: p.paymentMode || "UPI",
                status: "Success",
                date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              });
            });
          }
        });

        setPayments(extractedPayments);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
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
    return {
      successTotal: payments.filter(p => p.status === "Success").reduce((acc, p) => acc + p.amount, 0),
      pendingTotal: payments.filter(p => p.status === "Pending").reduce((acc, p) => acc + p.amount, 0),
      count: payments.length
    };
  }, [payments]);

  // Filter Pipeline
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = (p.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.invoiceId || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === "All" || (p.mode || '').includes(filterMode);
      return matchesSearch && matchesMode;
    });
  }, [payments, searchQuery, filterMode]);

  // 📥 Native Chrome Excel/CSV Download Engine
  const downloadPaymentsExcel = () => {
    const headers = ["Transaction ID", "Invoice Mapping", "Payer Name", "Payment Mode", "Settled Amount (₹)", "Settlement Date", "Status"];
    
    const rows = filteredPayments.map(p => [
      p.id,
      p.invoiceId,
      `"${p.studentName}"`,
      p.mode,
      p.amount,
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
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setSubmitting(true);
    try {
      if (formData.feeId) {
        await api.franchise.recordPayment(formData.feeId, {
          amount: Number(formData.amount),
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
          amount: Number(formData.amount),
          mode: formData.mode,
          status: formData.status,
          date: new Date().toISOString().split('T')[0]
        };
        setPayments([newTxn, ...payments]);
      }

      setIsRecordOpen(false);
      setFormData({ feeId: "", studentName: "", amount: "", mode: "UPI (GPay)", status: "Success", referenceNumber: "" });
    } catch (err) {
      console.error("Record payment error:", err);
      alert(err.message || "Failed to record payment.");
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
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 font-bold">Settled Net Inflow</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{metrics.successTotal.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl"><CheckCircle size={18} /></div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400 font-bold">Cheque Inbound Clearances</div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">₹{metrics.pendingTotal.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 rounded-xl"><Clock size={18} /></div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 font-bold">Total Cleared Logs</div>
            <div className="text-xl font-black text-blue-900 dark:text-blue-300 mt-1">{metrics.count} Transactions</div>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-400 rounded-xl"><ArrowDownLeft size={18} /></div>
        </div>
      </div>

      {/* Filters Search Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 text-slate-400" size={14} />
          <input type="text" placeholder="Search Txn ID, Student, Invoice..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400" />
        </div>
        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none w-full sm:w-43 sm:ml-auto focus:border-indigo-500 cursor-pointer">
          <option value="All">All Payment Modes</option>
          <option value="UPI">UPI (GPay/PhonePe)</option>
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
                <th className="py-4 px-6">Invoice Mapping</th>
                <th className="py-4 px-6">Payer Name</th>
                <th className="py-4 px-6">Instrument / Mode</th>
                <th className="py-4 px-6 font-mono text-right">Settled Amount</th>
                <th className="py-4 px-6 text-center">Settlement Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-indigo-500" size={18} />
                      <span>Loading live payment transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    No payment transactions recorded yet. Click "Record Payment" to log a transaction.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{p.id}</td>
                    <td className="py-4 px-6 font-mono text-slate-500 dark:text-slate-400">{p.invoiceId}</td>
                    <td className="py-4 px-6 font-black text-slate-900 dark:text-white">{p.studentName}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <CreditCard size={13} className="text-slate-500" /> {p.mode}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-right text-slate-900 dark:text-white font-black">₹{p.amount}</td>
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
              {feesList.length > 0 && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-bold">Select Student / Fee Invoice</label>
                  <select 
                    value={formData.feeId} 
                    onChange={(e) => {
                      const selectedFee = feesList.find(f => String(f.id) === e.target.value);
                      setFormData({
                        ...formData, 
                        feeId: e.target.value,
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
                    <option value="UPI (GPay)">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Cheque Instrument</option>
                    <option value="Card Swipe">POS Card Swipe</option>
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