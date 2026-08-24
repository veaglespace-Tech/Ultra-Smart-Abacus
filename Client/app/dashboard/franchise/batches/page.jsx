// src/app/dashboard/franchise/batches/page.jsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Calendar, Users, Clock, Pencil, Trash, X, Save, 
  Search, Download, BookOpen, Video, MapPin, CheckCircle, AlertCircle, Clock3, Check, Ban
} from "lucide-react";
import { api } from "@/services/api";

export default function FranchiseBatches() {
  const [activeTab, setActiveTab] = useState("slots"); // "slots" | "requests"
  const [batches, setBatches] = useState([]);
  const [batchRequests, setBatchRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Batch Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [isViewOpen, setIsViewOpen] = useState(false); 
  const [selectedBatch, setSelectedBatch] = useState(null); 
  const [editingBatch, setEditingBatch] = useState(null);

  // Batch Request Action Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveForm, setApproveForm] = useState({ room: 'Lab A', code: '' });
  const [rejectForm, setRejectForm] = useState({ rejectionReason: '' });
  const [processing, setProcessing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    slot: "Sat | 04:00 PM", teacher: "Aman Sharma", level: "Level 1", maxCapacity: 15, mode: "Offline", room: "Lab A", totalStudents: 0
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.franchise.getBatches();
      if (res && res.success) {
        const mapped = res.data.map(dbBatch => {
          let extra = {};
          try {
            extra = JSON.parse(dbBatch.description || '{}');
          } catch (e) {
            extra = {
              slot: "TBD",
              teacher: "TBD",
              mode: "Offline",
              room: dbBatch.description || "Room A"
            };
          }
          const studentCount = dbBatch.studentCount !== undefined ? dbBatch.studentCount : (Array.isArray(dbBatch.students) ? dbBatch.students.length : (dbBatch._count?.students || 0));
          return {
            id: dbBatch.id,
            dbId: dbBatch.id,
            code: dbBatch.code,
            name: dbBatch.name,
            level: dbBatch.level || "Level 1",
            maxCapacity: dbBatch.maxStudents || 15,
            totalStudents: studentCount,
            slot: extra.slot || "Sat | 04:00 PM",
            teacher: extra.teacher || "Aman Sharma",
            mode: extra.mode || "Offline",
            room: extra.room || "Lab A",
            status: studentCount >= (dbBatch.maxStudents || 15) ? "Full" : "Active"
          };
        });
        setBatches(mapped);
      }
    } catch (error) {
      console.error("Failed to load batches", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchRequests = async () => {
    try {
      const res = await api.batchRequests.getFranchiseRequests().catch(() => null);
      if (res && res.data && Array.isArray(res.data)) {
        setBatchRequests(res.data);
      }
    } catch (error) {
      console.error("Failed to load batch requests", error);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchBatchRequests();
  }, []);

  const pendingRequestsCount = useMemo(() => {
    return batchRequests.filter(r => r.status === 'PENDING').length;
  }, [batchRequests]);

  const metrics = useMemo(() => {
    return {
      total: batches.length,
      totalStudents: batches.reduce((acc, b) => acc + b.totalStudents, 0),
      fullBatches: batches.filter(b => b.totalStudents >= b.maxCapacity).length
    };
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchesSearch = batch.teacher.toLowerCase().includes(searchQuery.toLowerCase()) || String(batch.id).toLowerCase().includes(searchQuery.toLowerCase()) || batch.level.toLowerCase().includes(searchQuery.toLowerCase()) || batch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === "All" || batch.mode === filterMode;
      const matchesStatus = filterStatus === "All" || batch.status === filterStatus;
      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [batches, searchQuery, filterMode, filterStatus]);

  const filteredRequests = useMemo(() => {
    return batchRequests.filter(req => {
      const tName = req.teacher?.name || req.teacherName || '';
      return req.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             req.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
             tName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [batchRequests, searchQuery]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: `Batch ${formData.level}`,
      code: editingBatch ? editingBatch.code : `BTC-${Math.floor(1000 + Math.random() * 9000)}`,
      level: formData.level,
      maxStudents: Number(formData.maxCapacity),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      description: JSON.stringify({
        slot: formData.slot,
        teacher: formData.teacher,
        mode: formData.mode,
        room: formData.room
      })
    };

    try {
      if (editingBatch) {
        await api.batches.update(editingBatch.dbId, payload);
      } else {
        await api.batches.create(payload);
      }
      fetchBatches();
      setIsFormOpen(false);
      resetForm();
      setEditingBatch(null);
    } catch (error) {
      console.error("Failed to save batch", error);
      alert(error.message || "Error saving batch");
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setProcessing(true);
      const res = await api.batchRequests.approve(selectedRequest.id, approveForm);
      if (res && res.success) {
        alert("Batch request approved! New batch slot has been created and assigned to the teacher.");
        setApproveModalOpen(false);
        setSelectedRequest(null);
        fetchBatches();
        fetchBatchRequests();
      }
    } catch (err) {
      console.error("Failed to approve batch request", err);
      alert(err.message || "Failed to approve batch request");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setProcessing(true);
      const res = await api.batchRequests.reject(selectedRequest.id, rejectForm);
      if (res && res.success) {
        alert("Batch request rejected.");
        setRejectModalOpen(false);
        setSelectedRequest(null);
        fetchBatchRequests();
      }
    } catch (err) {
      console.error("Failed to reject batch request", err);
      alert(err.message || "Failed to reject batch request");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this batch slot?")) {
      try {
        await api.batches.delete(id);
        fetchBatches();
        setIsViewOpen(false);
      } catch (error) {
        console.error("Failed to delete batch", error);
        alert(error.message || "Error deleting batch");
      }
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
    <div className="space-y-6 w-full text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">FRANCHISE BATCH MANAGEMENT</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Structure time slots, review teacher batch requests, and approve new class cohorts.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={exportToCSV} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5">
            <Download size={13} /><span>Export Roster</span>
          </button>
          <button onClick={() => { setEditingBatch(null); resetForm(); setIsFormOpen(true); }} className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine">
            <Plus size={13} /><span>Create Slot</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Active Batches</div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics.total}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-650">Total Seated Students</div>
          <div className="text-xl font-black text-indigo-600 mt-1">{metrics.totalStudents} Pupils</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Pending Teacher Requests</div>
          <div className="text-xl font-black text-amber-800 mt-1">{pendingRequestsCount} Requests</div>
        </div>
      </div>

      {/* TABS & FILTERS LINE */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("slots")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "slots"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Active Time Slots ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <span>Teacher Batch Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter / Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-450" size={14} />
            <input type="text" placeholder="Search teacher, batch, level..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 rounded-lg pl-9 pr-4 py-1.5 border border-slate-200 focus:outline-none focus:border-indigo-500" />
          </div>
          {activeTab === "slots" && (
            <div className="flex gap-2">
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none text-[11px] cursor-pointer">
                <option value="All">All Modes</option><option value="Offline">Offline</option><option value="Online">Online</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE BATCH SLOTS TABLE */}
      {activeTab === "slots" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-500">
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
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredBatches.map((batch) => {
                  const isFull = batch.totalStudents >= batch.maxCapacity;
                  return (
                    <tr key={batch.id} onClick={(e) => handleRowClick(batch, e)} className="hover:bg-slate-50/50 cursor-pointer transition-colors group">
                      <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{batch.id}</td>
                      <td className="py-3 px-6 font-bold text-slate-900 group-hover:text-indigo-650 transition-colors">
                        <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-455" /> {batch.slot}</span>
                      </td>
                      <td className="py-3 px-6 text-slate-900">{batch.teacher}</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-mono font-bold text-[10px]">{batch.level}</span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex flex-col items-center justify-center gap-1 w-20 mx-auto">
                          <span className="font-mono text-[10px] text-slate-500">{batch.totalStudents} / {batch.maxCapacity}</span>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className={`h-full ${isFull ? 'bg-amber-700' : 'bg-indigo-600'}`} style={{ width: `${(batch.totalStudents / batch.maxCapacity) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${batch.mode === "Online" ? "text-blue-700" : "text-emerald-700"}`}>
                          {batch.mode === "Online" ? <Video size={12} /> : <MapPin size={12} />}{batch.mode}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-550 font-mono">{batch.room}</td>
                      <td className="py-3 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isFull ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {isFull ? "Full" : batch.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(batch)} className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><Pencil size={13} /></button>
                          <button onClick={() => handleDelete(batch.id)} className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredBatches.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold border-t border-slate-100">
              No batch slots found.
            </div>
          )}
        </div>
      )}

      {/* TEACHER BATCH REQUESTS TABLE */}
      {activeTab === "requests" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <th className="py-3 px-4">Req ID</th>
                  <th className="py-3 px-6">Teacher Instructor</th>
                  <th className="py-3 px-6">Proposed Batch Name</th>
                  <th className="py-3 px-6">Level & Timing</th>
                  <th className="py-3 px-6">Mode & Capacity</th>
                  <th className="py-3 px-6">Remarks / Notes</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredRequests.map((req) => {
                  const teacherName = req.teacher?.name || req.teacherName || "Instructor";
                  const isPending = req.status === "PENDING";
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-indigo-600 font-bold">REQ-{req.id}</td>
                      <td className="py-3 px-6 font-bold text-slate-900">{teacherName}</td>
                      <td className="py-3 px-6 font-bold text-indigo-700">{req.batchName}</td>
                      <td className="py-3 px-6">
                        <span className="font-bold text-slate-900 block">{req.level}</span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock size={11} />{req.timing}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="font-bold text-slate-800 block">{req.mode || 'Offline'}</span>
                        <span className="text-[10px] text-slate-500">Cap: {req.maxStudents || 15} pupils</span>
                      </td>
                      <td className="py-3 px-6 text-slate-500 text-[11px] max-w-xs">
                        {req.status === 'REJECTED' && req.rejectionReason ? (
                          <span className="text-rose-600 font-medium">Rejected: {req.rejectionReason}</span>
                        ) : (
                          req.remarks || "No additional remarks"
                        )}
                      </td>
                      <td className="py-3 px-6 text-center">
                        {req.status === 'PENDING' && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Clock3 size={11} /> Pending
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle size={11} /> Approved
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                            <AlertCircle size={11} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setApproveForm({ room: 'Lab A', code: `BTC-${Math.floor(1000 + Math.random() * 9000)}` });
                                setApproveModalOpen(true);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setRejectForm({ rejectionReason: '' });
                                setRejectModalOpen(true);
                              }}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Ban size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold border-t border-slate-100">
              No batch requests received from teachers.
            </div>
          )}
        </div>
      )}

      {/* APPROVE REQUEST MODAL */}
      {approveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-xl relative text-slate-800">
            <button onClick={() => setApproveModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={16} /></button>
            
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle size={20} /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">APPROVE BATCH REQUEST</h3>
                <p className="text-[11px] text-slate-400">Creates new batch slot and assigns to instructor.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-4 text-xs font-mono space-y-1">
              <p><span className="text-slate-500">Teacher:</span> <strong className="text-slate-900">{selectedRequest.teacher?.name || selectedRequest.teacherName}</strong></p>
              <p><span className="text-slate-500">Proposed Batch:</span> <strong className="text-indigo-700">{selectedRequest.batchName}</strong> ({selectedRequest.level})</p>
              <p><span className="text-slate-500">Requested Timing:</span> <strong className="text-slate-800">{selectedRequest.timing}</strong></p>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Assigned Classroom / Room</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Lab A or Room 102" 
                  value={approveForm.room} 
                  onChange={(e) => setApproveForm({...approveForm, room: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Batch Identification Code</label>
                <input 
                  type="text" 
                  required 
                  value={approveForm.code} 
                  onChange={(e) => setApproveForm({...approveForm, code: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setApproveModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-pointer hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={processing} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50">
                  {processing ? "Approving..." : "Confirm Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT REQUEST MODAL */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-xl relative text-slate-800">
            <button onClick={() => setRejectModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={16} /></button>
            
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><AlertCircle size={20} /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">REJECT BATCH REQUEST</h3>
                <p className="text-[11px] text-slate-400">Decline request submitted by instructor.</p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Reason for Rejection</label>
                <textarea 
                  rows="3" 
                  required
                  placeholder="e.g. Requested time slot conflicts with existing lab schedules..." 
                  value={rejectForm.rejectionReason} 
                  onChange={(e) => setRejectForm({ rejectionReason: e.target.value })} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-pointer hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={processing} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-all shadow-md shadow-rose-600/20 disabled:opacity-50">
                  {processing ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPOUT DETAILS MODAL FOR ACTIVE BATCH */}
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