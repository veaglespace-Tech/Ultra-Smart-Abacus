"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, DollarSign, AlertCircle, CheckCircle, Bell, Download, GraduationCap, Calendar, Plus, Edit2, Trash2, X, User, Eye } from 'lucide-react';

export default function FranchiseFees() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({ id: "", student: "", level: "Level 1", amount: "", dueDate: "", status: "Overdue" });

  const [feeData, setFeeData] = useState([
    { id: "TXN-701", student: "Isha Sharma", level: "Level 2", amount: 3500, dueDate: "2026-06-15", status: "Overdue" },
    { id: "TXN-699", student: "Rohan Deshmukh", level: "Level 1", amount: 4500, dueDate: "2026-06-02", status: "Overdue" },
    { id: "TXN-654", student: "Aditya Patil", level: "Level 4", amount: 3500, dueDate: "2026-05-20", status: "Paid" },
    { id: "TXN-642", student: "Ananya Joshi", level: "Level 3", amount: 4000, dueDate: "2026-06-18", status: "Paid" },
  ]);

  const totalCollected = feeData.filter(f => f.status === "Paid").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPending = feeData.filter(f => f.status === "Overdue").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalTarget = totalCollected + totalPending || 1;

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setIsActionModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.student || !formData.amount) return;

    const newTxn = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      student: formData.student,
      level: formData.level,
      amount: parseInt(formData.amount) || 0,
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
      status: formData.status
    };
    setFeeData([newTxn, ...feeData]);
    setIsAddModalOpen(false);
    setFormData({ id: "", student: "", level: "Level 1", amount: "", dueDate: "", status: "Overdue" });
  };

  const handleEditTrigger = () => {
    if (!selectedRow) return;
    setFormData(selectedRow);
    setIsActionModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedData = feeData.map(item => item.id === selectedRow.id ? { ...formData, amount: parseInt(formData.amount) } : item);
    setFeeData(updatedData);
    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  const handleDeleteTrigger = () => {
    if (!selectedRow) return;
    if (window.confirm(`Are you sure you want to delete transaction ${selectedRow.id}?`)) {
      setFeeData(feeData.filter(item => item.id !== selectedRow.id));
      setIsActionModalOpen(false);
      setSelectedRow(null);
    }
  };

  const toggleStatus = () => {
    if (!selectedRow) return;
    const nextStatus = selectedRow.status === "Paid" ? "Overdue" : "Paid";
    setFeeData(feeData.map(item => item.id === selectedRow.id ? { ...item, status: nextStatus } : item));
    setSelectedRow({ ...selectedRow, status: nextStatus });
  };

  const filteredData = feeData.filter(item => {
    const matchesSearch = item.student.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const downloadLedgerExcel = () => {
    const headers = ["Invoice ID", "Student Name", "Abacus Level", "Amount (₹)", "Due Date", "Status"];
    
    const rows = filteredData.map(item => [
      item.id,
      `"${item.student}"`, 
      item.level,
      item.amount,
      item.dueDate,
      item.status
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fee_Ledger_${statusFilter}_Export.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#fcfbfa] text-[#2c3539] max-w-[1600px] mx-auto font-sans min-h-screen relative">
      
      {/* Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#1a202c] tracking-tight flex items-center gap-2">
            Fee & <span className="text-[#4a5d4e]">Collection Ledger</span>
          </h2>
          <p className="text-xs text-[#7a8475] mt-1">Click on any student row to manage status, receipts, edits, or deeper view options.</p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-center">
          <button 
            onClick={downloadLedgerExcel}
            className="px-4 py-2.5 bg-[#f4f0e6] hover:bg-[#e2dcd0]/70 text-[#4a5d4e] font-bold rounded-xl border border-[#e2dcd0] transition-all flex items-center gap-2 cursor-pointer text-xs"
          >
            <Download size={14} /> Download Ledger Excel
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#4a5d4e] hover:bg-[#3d4d40] text-[#fcfbfa] font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs"
          >
            <Plus size={16} /> Record Fee Payment
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-4 rounded-2xl shadow-sm">
          <p className="text-[#7a8475] font-medium text-xs">Total Collected</p>
          <p className="text-2xl font-bold text-[#1a202c] font-mono mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-sm">
          <p className="text-rose-800 font-medium text-xs">Outstanding Dues</p>
          <p className="text-2xl font-bold text-rose-700 font-mono mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#f4f0e6]/60 border border-[#e2dcd0] p-4 rounded-2xl shadow-sm">
          <p className="text-[#4a5d4e] font-medium text-xs">Collection Efficiency</p>
          <p className="text-2xl font-bold text-[#4a5d4e] font-mono mt-1">{Math.round((totalCollected / totalTarget) * 100)}%</p>
        </div>
      </div>

      {/* Filters Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f4f0e6]/40 border border-[#e2dcd0] p-3 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7a8475]" />
          <input 
            type="text" 
            placeholder="Search student or transaction ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl pl-9 pr-4 py-2 text-[#2c3539] focus:outline-none focus:border-[#4a5d4e] text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {['All', 'Paid', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] font-mono ${
                statusFilter === status ? 'bg-[#4a5d4e] text-white shadow-sm' : 'bg-[#fcfbfa] text-[#7a8475] border border-[#e2dcd0] hover:bg-[#f4f0e6]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-wider text-[#4a5d4e] font-mono">
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Abacus Level</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dcd0]/60 text-[#2c3539] font-medium">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-[#f4f0e6]/30 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono text-[#4a5d4e] font-bold">{row.id}</td>
                    <td className="py-4 px-6 font-bold text-[#1a202c] text-sm">{row.student}</td>
                    <td className="py-4 px-6">
                      <span className="text-[#4a5d4e] font-semibold inline-flex items-center gap-1 bg-[#f4f0e6] border border-[#e2dcd0] px-2 py-0.5 rounded-lg">
                        <GraduationCap size={12} /> {row.level}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#1a202c] font-mono">₹{row.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-[#7a8475] font-mono inline-flex items-center gap-1.5 mt-2">
                      <Calendar size={12} className="text-[#7a8475]" /> {row.dueDate}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide inline-block min-w-[75px] font-mono ${
                        row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        ● {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="py-10 text-center text-[#7a8475] font-medium">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Sheet Modal */}
      {isActionModalOpen && selectedRow && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-6 shadow-xl relative overflow-hidden text-[#2c3539]">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedRow.status === 'Paid' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
            
            <button onClick={() => setIsActionModalOpen(false)} className="absolute top-4 right-4 text-[#7a8475] hover:text-[#1a202c] cursor-pointer"><X size={16} /></button>
            
            <div className="flex items-center gap-3 border-b border-[#e2dcd0] pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f4f0e6] border border-[#e2dcd0] flex items-center justify-center text-[#4a5d4e] font-bold"><User size={18} /></div>
              <div>
                <h4 className="text-sm font-black text-[#1a202c]">{selectedRow.student}</h4>
                <p className="text-[10px] text-[#7a8475] font-mono font-bold">{selectedRow.id} | {selectedRow.level}</p>
              </div>
            </div>

            <div className="bg-[#f4f0e6]/40 border border-[#e2dcd0] rounded-xl p-3 space-y-2.5 font-mono mb-4 text-[#2c3539]">
              <div className="flex justify-between"><span>Amount:</span><span className="text-[#1a202c] font-bold">₹{selectedRow.amount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Date:</span><span className="text-[#2c3539]">{selectedRow.dueDate}</span></div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <button type="button" onClick={toggleStatus} className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all active:scale-95 ${selectedRow.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {selectedRow.status} (Toggle)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {selectedRow.status === 'Paid' ? (
                  <button type="button" className="w-full bg-[#f4f0e6] hover:bg-[#e2dcd0] text-[#4a5d4e] border border-[#e2dcd0] rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Download size={13} /> Slip</button>
                ) : (
                  <button type="button" className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Bell size={13} /> Remind</button>
                )}
              
                <button type="button" onClick={() => router.push(`/dashboard/franchise/fees/${selectedRow.id}`)} className="w-full bg-[#fcfbfa] hover:bg-[#f4f0e6] border border-[#e2dcd0] text-[#2c3539] rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Eye size={13} /> Profile</button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e2dcd0]">
                <button type="button" onClick={handleEditTrigger} className="w-full bg-[#f4f0e6] hover:bg-amber-50 text-amber-700 rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Edit2 size={12} /> Edit</button>
                <button type="button" onClick={handleDeleteTrigger} className="w-full bg-[#f4f0e6] hover:bg-rose-50 text-rose-700 rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"><Trash2 size={12} /> Delete</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Record Fee Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-5 shadow-xl relative text-[#2c3539]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-[#7a8475] cursor-pointer"><X size={16} /></button>
            <h3 className="text-[#1a202c] font-bold mb-4 font-mono uppercase text-xs tracking-wide">Record Fee Payment</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Student Name</label>
                <input type="text" required value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs focus:outline-none focus:border-[#4a5d4e]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Amount (₹)</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs focus:outline-none focus:border-[#4a5d4e]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Due/Paid Date</label>
                  <input type="date" required value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs font-mono focus:outline-none focus:border-[#4a5d4e]" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#4a5d4e] hover:bg-[#3d4d40] text-[#fcfbfa] font-bold cursor-pointer text-xs">Add Transaction</button>
            </form>
          </div>
        </div>
      )}

      {/* Modify Ledger Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-5 shadow-xl relative text-[#2c3539]">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-[#7a8475] cursor-pointer"><X size={16} /></button>
            <h3 className="text-[#4a5d4e] font-bold mb-4 font-mono uppercase text-xs">Modify Ledger ({selectedRow?.id})</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Student Name</label>
                <input type="text" required value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs focus:outline-none focus:border-[#4a5d4e]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Amount (₹)</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs focus:outline-none focus:border-[#4a5d4e]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#7a8475] uppercase font-bold block mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#2c3539] text-xs focus:outline-none focus:border-[#4a5d4e]">
                    <option value="Overdue">Overdue</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#4a5d4e] hover:bg-[#3d4d40] text-[#fcfbfa] font-bold cursor-pointer text-xs">Save Modifications</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}