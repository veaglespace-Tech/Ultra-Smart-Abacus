"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Bell, Download, Calendar, Plus, Edit2, Trash2, X, User } from "lucide-react";
import { api } from "@/services/api";
import { storageService } from "@/services/storage.services";

export default function FranchiseFees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fees, setFees] = useState([]);
  const [franchiseId, setFranchiseId] = useState(null);
  const [analytics, setAnalytics] = useState({ totalCollected: 0, totalPending: 0, overdue: 0, totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    totalAmount: "",
    paidAmount: "",
    fineAmount: "",
    discountAmount: "",
    dueDate: "",
    notes: "",
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const [feesRes, analyticsRes, profileRes] = await Promise.all([
        api.franchise.getFees(),
        api.franchise.getFeeAnalytics(),
        api.franchise.getProfile().catch(() => null)
      ]);

      if (profileRes?.franchise?.id) {
        setFranchiseId(profileRes.franchise.id);
      }

      const list = (feesRes?.data || []).map((fee) => ({
        id: fee.id,
        student: fee.student?.name || "Unknown Student",
        studentId: fee.studentId,
        level: fee.student?.batch?.level || "Level 1",
        totalAmount: Number(fee.totalFee || 0),
        paidAmount: Number(fee.paidAmount || 0),
        pendingAmount: Number(fee.dueAmount || 0),
        fineAmount: Number(fee.fineAmount || 0),
        discountAmount: Number(fee.discountAmount || 0),
        dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split("T")[0] : "—",
        status: fee.status,
        receiptNumber: fee.receiptNumber,
        notes: fee.notes,
      }));
      setFees(list);
      setAnalytics(analyticsRes?.data || { totalCollected: 0, totalPending: 0, overdue: 0, totalRecords: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const filteredData = useMemo(() => {
    return fees.filter((item) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = item.student.toLowerCase().includes(search) || String(item.id).includes(search) || (item.receiptNumber || "").toLowerCase().includes(search);
      const matchesFilter = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [fees, searchTerm, statusFilter]);

  const totalCollected = useMemo(() => fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0), [fees]);
  const totalPending = useMemo(() => fees.reduce((sum, fee) => sum + (fee.pendingAmount || 0), 0), [fees]);
  const totalTarget = totalCollected + totalPending || 1;

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setIsActionModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Get logged-in franchise ID (use state, fallback to user storage)
      let resolvedFranchiseId = franchiseId;
      if (!resolvedFranchiseId) {
        const user = storageService.getUser();
        resolvedFranchiseId = user?.franchise?.id;
      }
      
      // 1b. System Fallback: If still not found and user is ADMIN, fetch the first franchise from the list
      if (!resolvedFranchiseId) {
        const user = storageService.getUser();
        if (user?.role === "ADMIN") {
          try {
            const franchisesRes = await api.admin.getFranchises();
            const firstFranchise = franchisesRes?.franchises?.[0] || franchisesRes?.data?.[0];
            if (firstFranchise) {
              resolvedFranchiseId = firstFranchise.id;
            }
          } catch (err) {
            console.error("Failed to fetch fallback franchise:", err);
          }
        }
      }

      // 1c. Dev/Testing Fallback
      if (!resolvedFranchiseId) {
        resolvedFranchiseId = 1;
      }

      // 2. Fetch student details to get batchId
      const studentRes = await api.franchise.getStudentById(formData.studentId);
      const batchId = studentRes?.data?.batchId;
      if (!batchId) {
        throw new Error(`Student #${formData.studentId} has no assigned batch.`);
      }

      // 3. Create Fee record with all required details
      await api.franchise.createFee({
        studentId: Number(formData.studentId),
        franchiseId: Number(resolvedFranchiseId),
        batchId: Number(batchId),
        totalFee: Number(formData.totalAmount),
        paidAmount: Number(formData.paidAmount || 0),
      });

      setIsAddModalOpen(false);
      setFormData({ studentId: "", totalAmount: "", paidAmount: "", fineAmount: "", discountAmount: "", dueDate: "", notes: "" });
      fetchFees();
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not create fee record");
    }
  };

  const handleEditTrigger = () => {
    if (!selectedRow) return;
    setFormData({
      studentId: selectedRow.studentId,
      totalAmount: selectedRow.totalAmount,
      paidAmount: selectedRow.paidAmount,
      fineAmount: selectedRow.fineAmount,
      discountAmount: selectedRow.discountAmount,
      dueDate: selectedRow.dueDate !== "—" ? selectedRow.dueDate : "",
      notes: selectedRow.notes || "",
    });
    setIsActionModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.franchise.updateFee(selectedRow.id, {
        totalFee: Number(formData.totalAmount),
      });
      setIsEditModalOpen(false);
      setSelectedRow(null);
      fetchFees();
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not update fee record");
    }
  };

  const handleDeleteTrigger = async () => {
    if (!selectedRow) return;
    if (window.confirm(`Delete fee record ${selectedRow.id}?`)) {
      try {
        await api.franchise.deleteFee(selectedRow.id);
        setIsActionModalOpen(false);
        setSelectedRow(null);
        fetchFees();
      } catch (error) {
        console.error(error);
        alert(error.message || "Could not delete fee record");
      }
    }
  };

  const handleRecordInstallment = async () => {
    if (!selectedRow) return;
    const amount = window.prompt(`Enter installment amount for ${selectedRow.student}`);
    if (!amount) return;
    try {
      await api.franchise.recordPayment(selectedRow.id, { amount: Number(amount), paymentMethod: "UPI", notes: "Installment received" });
      setSelectedRow({ ...selectedRow, status: "PARTIAL" });
      fetchFees();
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not record payment");
    }
  };

  const handleReminder = async () => {
    if (!selectedRow) return;
    try {
      await api.franchise.sendReminder(selectedRow.id);
      alert("Reminder sent successfully");
    } catch (error) {
      alert(error.message || "Reminder failed");
    }
  };

  const downloadLedgerCSV = () => {
    const rows = filteredData.map((item) => [item.id, item.student, item.level, item.totalAmount, item.paidAmount, item.pendingAmount, item.status].join(","));
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + ["id,student,level,totalAmount,paidAmount,pendingAmount,status", ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fee_Ledger_${statusFilter}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto font-sans min-h-screen relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">Fee & <span className="text-emerald-700 dark:text-emerald-450">Collection Ledger</span></h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Professional ERP-style fee tracking for installment payments, reminders, and receipts.</p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-center">
          <button onClick={downloadLedgerCSV} className="px-4 py-2.5 bg-slate-55 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-2 cursor-pointer text-xs">
            <Download size={14} /> Export Ledger
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs">
            <Plus size={16} /> Record Fee Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-slate-550 dark:text-slate-400 font-medium text-xs">Total Collected</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">₹{totalCollected.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl shadow-sm">
          <p className="text-rose-800 dark:text-rose-400 font-medium text-xs">Outstanding Dues</p>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 font-mono mt-1">₹{totalPending.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-slate-900/40 border border-emerald-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-emerald-800 dark:text-emerald-450 font-medium text-xs">Collection Efficiency</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-1">{Math.round((totalCollected / totalTarget) * 100)}%</p>
        </div>
        <div className="bg-amber-55 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl shadow-sm">
          <p className="text-amber-800 dark:text-amber-400 font-medium text-xs">Overdue Records</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 font-mono mt-1">{analytics.overdue}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-400" />
          <input type="text" placeholder="Search student or receipt..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600 text-xs font-medium" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {['All', 'PAID', 'PARTIAL', 'PENDING'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] font-mono ${statusFilter === status ? "bg-emerald-600 text-white shadow-sm border border-emerald-650" : "bg-white dark:bg-slate-950 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-slate-300 font-mono">
                <th className="py-4 px-6">Receipt</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200 font-medium">
              {loading ? <tr><td colSpan="5" className="py-10 text-center text-slate-400 dark:text-slate-400">Loading fee records...</td></tr> : filteredData.length > 0 ? filteredData.map((row) => (
                <tr key={row.id} onClick={() => handleRowClick(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group">
                  <td className="py-4 px-6 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{row.receiptNumber || `#${row.id}`}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm">{row.student}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white font-mono">₹{row.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono inline-flex items-center gap-1.5 mt-2"><Calendar size={12} className="text-slate-400 dark:text-slate-400" /> {row.dueDate}</td>
                  <td className="py-4 px-6 text-center"><span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide inline-block min-w-[75px] font-mono ${row.status === "PAID" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/40" : row.status === "PARTIAL" ? "bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-900/40" : "bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 border border-rose-250 dark:border-rose-900/40"}`}>● {row.status}</span></td>
                </tr>
              )) : <tr><td colSpan="5" className="py-10 text-center text-slate-400 dark:text-slate-400 font-medium">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isActionModalOpen && selectedRow && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-xl relative overflow-hidden text-slate-800 dark:text-slate-200">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedRow.status === "PAID" ? "bg-emerald-600" : selectedRow.status === "PARTIAL" ? "bg-amber-600" : "bg-rose-600"}`} />
            <button onClick={() => setIsActionModalOpen(false)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={16} /></button>
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-700 dark:text-slate-200 font-bold"><User size={18} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedRow.student}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono font-bold">{selectedRow.receiptNumber || `#${selectedRow.id}`} | {selectedRow.level}</p>
              </div>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2.5 font-mono mb-4 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between"><span>Total:</span><span className="text-slate-900 dark:text-white font-bold">₹{selectedRow.totalAmount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Paid:</span><span className="text-slate-700 dark:text-slate-300">₹{selectedRow.paidAmount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Pending:</span><span className="text-rose-600 dark:text-rose-455 font-bold">₹{selectedRow.pendingAmount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Due Date:</span><span className="text-slate-700 dark:text-slate-300">{selectedRow.dueDate}</span></div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleRecordInstallment} className="w-full bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Plus size={13} /> Installment</button>
                <button type="button" onClick={handleReminder} className="w-full bg-amber-50 dark:bg-amber-955/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Bell size={13} /> Remind</button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={handleEditTrigger} className="w-full bg-slate-50 dark:bg-slate-850 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-400 rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Edit2 size={12} /> Edit</button>
                <button type="button" onClick={handleDeleteTrigger} className="w-full bg-slate-50 dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-slate-850 text-rose-700 dark:text-rose-455 rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-xl relative text-slate-800 dark:text-slate-200">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-400 cursor-pointer"><X size={16} /></button>
            <h3 className="text-slate-900 dark:text-white font-bold mb-4 font-mono uppercase text-xs tracking-wide">Create Fee Record</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Student ID</label>
                <input type="number" required value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Total Amount (₹)</label>
                  <input type="number" required value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Paid Amount (₹)</label>
                  <input type="number" value={formData.paidAmount} onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Fine (₹)</label>
                  <input type="number" value={formData.fineAmount} onChange={(e) => setFormData({ ...formData, fineAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Discount (₹)</label>
                  <input type="number" value={formData.discountAmount} onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
              </div>
              <div>
                <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" rows="3" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs">Save Record</button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-xl relative text-slate-800 dark:text-slate-200">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-400 cursor-pointer"><X size={16} /></button>
            <h3 className="text-slate-900 dark:text-white font-bold mb-4 font-mono uppercase text-xs">Edit Fee Record</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold block mb-1">Total Fee (₹)</label>
                <input type="number" required value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-600" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}};