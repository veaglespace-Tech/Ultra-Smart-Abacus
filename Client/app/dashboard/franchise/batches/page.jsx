// src/app/dashboard/franchise/batches/page.jsx
"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, Calendar, Users, Clock, Pencil, Trash, X, Save, 
  Search, Download, BookOpen, Video, MapPin, CheckCircle
} from "lucide-react";

export default function FranchiseBatches() {
  const [batches, setBatches] = useState([
    { id: "BTC-101", slot: "Sat | 04:00 PM", teacher: "Aman Sharma", level: "Level 1", totalStudents: 12, maxCapacity: 15, mode: "Offline", room: "Lab A", status: "Active" },
    { id: "BTC-102", slot: "Sat | 05:30 PM", teacher: "Sarah Jenkins", level: "Level 4", totalStudents: 8, maxCapacity: 10, mode: "Online", room: "Zoom Room 1", status: "Active" },
    { id: "BTC-103", slot: "Sun | 10:30 AM", teacher: "Neha Patel", level: "Level 2", totalStudents: 15, maxCapacity: 15, mode: "Offline", room: "Lab B", status: "Full" },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [isViewOpen, setIsViewOpen] = useState(false); 
  const [selectedBatch, setSelectedBatch] = useState(null); 
  const [editingBatch, setEditingBatch] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    slot: "Sat | 04:00 PM", teacher: "Aman Sharma", level: "Level 1", maxCapacity: 15, mode: "Offline", room: "Lab A", totalStudents: 0
  });

  const metrics = useMemo(() => {
    return {
      total: batches.length,
      totalStudents: batches.reduce((acc, b) => acc + b.totalStudents, 0),
      fullBatches: batches.filter(b => b.totalStudents >= b.maxCapacity).length
    };
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchesSearch = batch.teacher.toLowerCase().includes(searchQuery.toLowerCase()) || batch.id.toLowerCase().includes(searchQuery.toLowerCase()) || batch.level.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === "All" || batch.mode === filterMode;
      const matchesStatus = filterStatus === "All" || batch.status === filterStatus;
      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [batches, searchQuery, filterMode, filterStatus]);

  const exportToCSV = () => {
    try {
      const headers = ["Batch ID", "Time Slot", "Assigned Teacher", "Abacus Level", "Enrolled Students", "Max Capacity", "Mode", "Room / Link", "Status"];
      const rows = filteredBatches.map(b => [
        b.id, b.slot, b.teacher, b.level, b.totalStudents, b.maxCapacity, b.mode, b.room, b.totalStudents >= b.maxCapacity ? "Full" : b.status
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));

      const csvContent = [headers.join(","), ...rows].join("\n");
      const encodedUri = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Batch_Schedule_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV Download error", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const computedStatus = formData.totalStudents >= formData.maxCapacity ? "Full" : "Active";
    const recordPayload = { ...formData, status: computedStatus };

    if (editingBatch) {
      setBatches(batches.map(b => b.id === editingBatch.id ? { ...b, ...recordPayload } : b));
      setEditingBatch(null);
    } else {
      const newId = `BTC-${Math.floor(100 + Math.random() * 900)}`;
      setBatches([...batches, { id: newId, ...recordPayload }]);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this batch slot?")) {
      setBatches(batches.filter(b => b.id !== id));
      setIsViewOpen(false);
    }
  };

  const handleEdit = (batch) => {
    setIsViewOpen(false);
    setEditingBatch(batch);
    setFormData(batch);
    setIsFormOpen(true);
  };

  const handleRowClick = (batch, e) => {
    if (e.target.closest('button')) return;
    setSelectedBatch(batch);
    setIsViewOpen(true);
  };

  const resetForm = () => {
    setFormData({ slot: "Sat | 04:00 PM", teacher: "Aman Sharma", level: "Level 1", maxCapacity: 15, mode: "Offline", room: "Lab A", totalStudents: 0 });
  };

  return (
    <div className="space-y-6 w-full text-[#2c3539]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black tracking-tight text-[#1a202c] uppercase">Batch Time Slots</h2>
          <p className="text-[11px] text-[#8a9485] mt-0.5 font-medium">Structure time slots, optimize teacher assignment, and control classroom saturation.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f0e6] border border-[#e2dcd0] text-[11px] font-bold rounded-lg text-[#5a6455] hover:bg-[#e2dcd0]/50 transition-all cursor-pointer">
            <Download size={13} /><span>Export Roster</span>
          </button>
          <button onClick={() => { setEditingBatch(null); resetForm(); setIsFormOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a5d4e] text-[11px] font-bold rounded-lg text-[#fcfbfa] hover:bg-[#3d4d40] transition-all cursor-pointer shadow-sm">
            <Plus size={13} /><span>Create Slot</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#8a9485]">Total Active Batches</div>
          <div className="text-xl font-black text-[#1a202c] mt-1">{metrics.total}</div>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#4a5d4e]">Total Seated Students</div>
          <div className="text-xl font-black text-[#4a5d4e] mt-1">{metrics.totalStudents} Pupils</div>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">At Max Capacity</div>
          <div className="text-xl font-black text-amber-800 mt-1">{metrics.fullBatches} Slots</div>
        </div>
      </div>

      {/* FILTER DASHBOARD LINE */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-3 rounded-xl flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-[#8a9485]" size={14} />
          <input type="text" placeholder="Search by Level, Teacher, ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#f4f0e6]/40 text-xs text-[#1a202c] rounded-lg pl-9 pr-4 py-1.5 border border-[#e2dcd0] focus:outline-none focus:border-[#4a5d4e]" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="w-full sm:w-36 bg-[#fcfbfa] px-2 py-1.5 rounded-lg border border-[#e2dcd0] text-[#5a6455] font-medium focus:outline-none text-[11px]">
            <option value="All">All Modes</option><option value="Offline">Offline</option><option value="Online">Online</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full sm:w-36 bg-[#fcfbfa] px-2 py-1.5 rounded-lg border border-[#e2dcd0] text-[#5a6455] font-medium focus:outline-none text-[11px]">
            <option value="All">All Status</option><option value="Active">Active</option><option value="Full">Full</option>
          </select>
        </div>
      </div>

      {/* DATA ALLOCATION TABLE */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-wider text-[#7a8475]">
                <th className="py-3 px-4">Slot ID</th>
                <th className="py-3 px-6">Timing / Days</th>
                <th className="py-3 px-6">Assigned Instructor</th>
                <th className="py-3 px-6">Target Level</th>
                <th className="py-3 px-6 text-center">Occupancy Rate</th>
                <th className="py-3 px-6">Delivery Mode</th>
                <th className="py-3 px-6">Location/Room</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dcd0]/40 text-[#2c3539] font-medium">
              {filteredBatches.map((batch) => {
                const isFull = batch.totalStudents >= batch.maxCapacity;
                return (
                  <tr key={batch.id} onClick={(e) => handleRowClick(batch, e)} className="hover:bg-[#f5f2eb]/30 cursor-pointer transition-colors group">
                    <td className="py-3 px-4 font-mono text-[#4a5d4e] font-bold">{batch.id}</td>
                    <td className="py-3 px-6 font-bold text-[#1a202c] group-hover:text-[#4a5d4e] transition-colors">
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#8a9485]" /> {batch.slot}</span>
                    </td>
                    <td className="py-3 px-6 text-[#1a202c]">{batch.teacher}</td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 bg-[#4a5d4e]/10 text-[#4a5d4e] rounded border border-[#4a5d4e]/10 font-mono font-bold text-[10px]">{batch.level}</span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col items-center justify-center gap-1 w-20 mx-auto">
                        <span className="font-mono text-[10px] text-[#5a6455]">{batch.totalStudents} / {batch.maxCapacity}</span>
                        <div className="w-full bg-[#f4f0e6] h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${isFull ? 'bg-amber-700' : 'bg-[#4a5d4e]'}`} style={{ width: `${(batch.totalStudents / batch.maxCapacity) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${batch.mode === "Online" ? "text-blue-700" : "text-emerald-700"}`}>
                        {batch.mode === "Online" ? <Video size={12} /> : <MapPin size={12} />}{batch.mode}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-[#7a8475] font-mono">{batch.room}</td>
                    <td className="py-3 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isFull ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                        {isFull ? "Full" : batch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(batch)} className="p-1.5 text-[#8a9485] hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(batch.id)} className="p-1.5 text-[#8a9485] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPOUT DETAILS MODAL */}
      {isViewOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-sm rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedBatch.totalStudents >= selectedBatch.maxCapacity ? 'bg-amber-700' : 'bg-[#4a5d4e]'}`} />
            <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={15} /></button>
            
            <div className="flex items-center gap-3.5 mb-4 mt-2">
              <div className="p-2.5 bg-[#f4f0e6] border border-[#e2dcd0] rounded-xl text-[#4a5d4e]"><BookOpen size={18} /></div>
              <div>
                <h3 className="text-sm font-black text-[#1a202c] tracking-tight">{selectedBatch.level} Allocation</h3>
                <p className="text-[10px] text-[#8a9485] font-mono uppercase tracking-wider">{selectedBatch.id} | {selectedBatch.mode}</p>
              </div>
            </div>

            <div className="bg-[#f4f0e6]/50 border border-[#e2dcd0]/60 rounded-xl p-4 space-y-2.5 font-mono text-xs text-[#5a6455] mb-4">
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Time Schedule:</span><span className="text-[#1a202c] font-bold">{selectedBatch.slot}</span></div>
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Instructor:</span><span className="text-[#1a202c]">{selectedBatch.teacher}</span></div>
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Enrolled Seating:</span><span className="text-amber-800 font-bold">{selectedBatch.totalStudents} / {selectedBatch.maxCapacity} Seats</span></div>
              <div className="flex justify-between items-center"><span>Location Room:</span><span className="text-[#1a202c]">{selectedBatch.room}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleEdit(selectedBatch)} className="px-3 py-2 bg-[#f4f0e6] border border-[#e2dcd0] text-[#5a6455] rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#e2dcd0]/50 transition-all"><Pencil size={13} /> Adjust Slot</button>
              <button onClick={() => setIsViewOpen(false)} className="px-3 py-2 bg-[#4a5d4e] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#3d4d40] transition-all"><CheckCircle size={13} /> Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION EDIT & CREATION FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-md rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={15} /></button>
            <h3 className="text-xs font-black text-[#1a202c] mb-5 uppercase tracking-wider border-b border-[#e2dcd0] pb-2">{editingBatch ? `Modify Batch: ${editingBatch.id}` : "Configure New Batch Slot"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Timing Slot</label>
                  <input type="text" required placeholder="e.g., Sat | 04:00 PM" value={formData.slot} onChange={(e) => setFormData({...formData, slot: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none focus:border-[#4a5d4e]" />
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Abacus Level</label>
                  <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full px-2 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none">
                    <option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Level 3">Level 3</option><option value="Level 4">Level 4</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Assigned Teacher</label>
                  <input type="text" required value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Enrolled Head</label>
                  <input type="number" min="0" value={formData.totalStudents} onChange={(e) => setFormData({...formData, totalStudents: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Max Cap Limit</label>
                  <input type="number" min="1" required value={formData.maxCapacity} onChange={(e) => setFormData({...formData, maxCapacity: Number(e.target.value)})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Delivery Mode</label>
                  <select value={formData.mode} onChange={(e) => setFormData({...formData, mode: e.target.value})} className="w-full px-2 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none">
                    <option value="Offline">Offline</option><option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Room / Link Identity</label>
                  <input type="text" required placeholder="e.g., Lab A" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dcd0] mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-1.5 rounded-lg bg-[#fcfbfa] text-[#8a9485] border border-[#e2dcd0] cursor-pointer hover:text-[#1a202c] transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#4a5d4e] text-[#fcfbfa] font-bold cursor-pointer hover:bg-[#3d4d40] transition-all"><Save size={14} /><span>Save Slot</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}