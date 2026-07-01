"use client";

import React, { useState, useMemo } from "react";
import { 
  DollarSign, Search, CreditCard, ArrowDownLeft, CheckCircle, 
  Clock, AlertCircle, Filter, Download, Plus, X, Calendar, User
} from "lucide-react";

export default function PaymentsManagement() {
  const [payments, setPayments] = useState([
    { id: "TXN-99201", studentName: "Rohan Joshi", invoiceId: "INV-2026-001", amount: 5310, mode: "UPI (GPay)", status: "Success", date: "2026-06-10" },
    { id: "TXN-99202", studentName: "Ananya Nair", invoiceId: "INV-2026-002", amount: 5310, mode: "Cash", status: "Success", date: "2026-06-18" },
    { id: "TXN-99203", studentName: "Aditya Patil", invoiceId: "INV-2026-003", amount: 5310, mode: "Cheque", status: "Pending", date: "2026-06-22" },
  ]);

  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("All");

  // Form State for Recording New Payment Manual Entry
  const [formData, setFormData] = useState({
    studentName: "", invoiceId: "", amount: "", mode: "UPI (GPay)", status: "Success"
  });

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
      const matchesSearch = p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === "All" || p.mode.includes(filterMode);
      return matchesSearch && matchesMode;
    });
  }, [payments, searchQuery, filterMode]);

  // 📥 Native Chrome Excel/CSV Download Engine
  const downloadPaymentsExcel = () => {
    const headers = ["Transaction ID", "Invoice Mapping", "Payer Name", "Payment Mode", "Settled Amount (₹)", "Settlement Date", "Status"];
    
    const rows = filteredPayments.map(p => [
      p.id,
      p.invoiceId,
      `"${p.studentName}"`, // Handling spaces inside name safely
      p.mode,
      p.amount,
      p.date,
      p.status
    ].join(","));

    // \uFEFF forces Excel to render encoding correctly in UTF-8
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payments_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    link.click(); // Triggers Chrome's native download trajectory
    document.body.removeChild(link);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: formData.studentName,
      invoiceId: formData.invoiceId || "DIRECT-DEPOSIT",
      amount: Number(formData.amount),
      mode: formData.mode,
      status: formData.status,
      date: new Date().toISOString().split('T')[0]
    };

    setPayments([newTxn, ...payments]);
    setIsRecordOpen(false);
    setFormData({ studentName: "", invoiceId: "", amount: "", mode: "UPI (GPay)", status: "Success" });
  };

  return (
    <div className="space-y-6 p-4 md:p-6 text-[#2c3539] max-w-[1600px] mx-auto bg-[#fcfbfa] font-sans min-h-screen">
      
      {/* Top Banner Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#1a202c]">Payment <span className="text-[#4a5d4e]">Gateway Ledger</span></h2>
          <p className="text-xs text-[#7a8475] mt-1">Audit inbound cashflows, track direct UPI transfers, and manage manual cheque clears.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Chrome-friendly Download Action Button */}
          <button 
            onClick={downloadPaymentsExcel} 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#fcfbfa] hover:bg-[#f4f0e6] text-xs font-bold rounded-xl border border-[#e2dcd0] text-[#2c3539] transition-all cursor-pointer shadow-sm"
          >
            <Download size={14} className="text-[#7a8475]" /><span>Download Payments Excel</span>
          </button>
          <button 
            onClick={() => setIsRecordOpen(true)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4a5d4e] hover:bg-[#3d4d40] text-xs font-extrabold rounded-xl text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} /><span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Roster Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#7a8475] font-bold">Settled Net Inflow</div>
            <div className="text-xl font-black text-emerald-700 mt-1">₹{metrics.successTotal.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl"><CheckCircle size={18} /></div>
        </div>
        
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-700 font-bold">Cheque Inbound Clearances</div>
            <div className="text-xl font-black text-amber-700 mt-1">₹{metrics.pendingTotal.toLocaleString()}</div>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl"><Clock size={18} /></div>
        </div>
        
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-blue-700 font-bold">Total Cleared Logs</div>
            <div className="text-xl font-black text-blue-900 mt-1">{metrics.count} Transactions</div>
          </div>
          <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl"><ArrowDownLeft size={18} /></div>
        </div>
      </div>

      {/* Filters Search Matrix */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 text-[#7a8475]" size={14} />
          <input type="text" placeholder="Search Txn ID, Student, Invoice..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#fcfbfa] text-xs text-[#1a202c] rounded-xl pl-9 pr-4 py-2.5 border border-[#e2dcd0] focus:outline-none focus:border-[#4a5d4e] placeholder-[#7a8475]/60" />
        </div>
        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="bg-[#fcfbfa] px-3 py-2.5 rounded-xl border border-[#e2dcd0] text-xs text-[#2c3539] font-medium focus:outline-none w-full sm:w-43 sm:ml-auto focus:border-[#4a5d4e]">
          <option value="All">All Payment Modes</option>
          <option value="UPI">UPI (GPay/PhonePe)</option>
          <option value="Cash">Cash Deposits</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      {/* Main Core Roster Data Grid Table */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6]/60 text-[10px] uppercase font-bold tracking-wider text-[#4a5d4e] font-mono">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Invoice Mapping</th>
                <th className="py-4 px-6">Payer Name</th>
                <th className="py-4 px-6">Instrument / Mode</th>
                <th className="py-4 px-6 font-mono text-right">Settled Amount</th>
                <th className="py-4 px-6 text-center">Settlement Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dcd0]/60 text-[#2c3539] font-medium">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#f4f0e6]/30 transition-colors group">
                  <td className="py-4 px-6 font-mono text-[#4a5d4e] font-bold">{p.id}</td>
                  <td className="py-4 px-6 font-mono text-[#7a8475]">{p.invoiceId}</td>
                  <td className="py-4 px-6 font-black text-[#1a202c]">{p.studentName}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-[#2c3539]">
                      <CreditCard size={13} className="text-[#7a8475]" /> {p.mode}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-right text-[#1a202c] font-black">₹{p.amount}</td>
                  <td className="py-4 px-6 font-mono text-center text-[#7a8475]">{p.date}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      p.status === "Success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Entry Record Popup Form */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-md rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <button onClick={() => setIsRecordOpen(false)} className="absolute top-4 right-4 text-[#7a8475] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={16} /></button>
            <h3 className="text-xs font-black text-[#1a202c] mb-5 uppercase font-mono tracking-wider border-b border-[#e2dcd0] pb-2">Log Manual Payment Entry</h3>
            
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4a5d4e] mb-1.5 font-bold">Payer Student Name</label>
                <input type="text" required placeholder="e.g. Rahul Patil" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none focus:border-[#4a5d4e]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4a5d4e] mb-1.5 font-bold">Linked Invoice ID</label>
                  <input type="text" placeholder="e.g. INV-2026-001" value={formData.invoiceId} onChange={(e) => setFormData({...formData, invoiceId: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none focus:border-[#4a5d4e]" />
                </div>
                <div>
                  <label className="block text-[#4a5d4e] mb-1.5 font-bold">Collected Gross (₹)</label>
                  <input type="number" required placeholder="5310" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none focus:border-[#4a5d4e]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4a5d4e] mb-1.5 font-bold">Payment Instrument</label>
                  <select value={formData.mode} onChange={(e) => setFormData({...formData, mode: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] font-medium focus:outline-none focus:border-[#4a5d4e]">
                    <option value="UPI (GPay)">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Cheque Instrument</option>
                    <option value="Card Swipe">POS Card Swipe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4a5d4e] mb-1.5 font-bold">Clearance Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] font-medium focus:outline-none focus:border-[#4a5d4e]">
                    <option value="Success">Success (Settled)</option>
                    <option value="Pending">Pending (In-clearance)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dcd0] mt-2">
                <button type="button" onClick={() => setIsRecordOpen(false)} className="px-4 py-2 rounded-xl bg-[#fcfbfa] text-[#7a8475] border border-[#e2dcd0] cursor-pointer hover:text-[#1a202c] transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4a5d4e] hover:bg-[#3d4d40] text-white font-bold cursor-pointer transition-all shadow-sm"><DollarSign size={14} /><span>Commit Transaction</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}