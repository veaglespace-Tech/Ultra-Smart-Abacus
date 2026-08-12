// src/app/dashboard/teacher/batches/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, CalendarDays, Plus, Search, BookOpen, Clock, X, Send, CheckCircle, AlertCircle, Clock3 } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function TeacherBatchesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'requests'
  const [batches, setBatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    batchName: '',
    level: 'Level 1',
    timing: 'Mon-Wed 09:00 AM - 10:30 AM',
    mode: 'Offline',
    maxStudents: 15,
    remarks: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch batches
      const res = await api.batches.getAll().catch(() => null);
      let mapped = [];
      if (res && res.data && Array.isArray(res.data)) {
        mapped = res.data.map(dbBatch => {
          let extra = {};
          try {
            extra = JSON.parse(dbBatch.description || '{}');
          } catch (e) {
            extra = {
              slot: "TBD",
              teacher: "TBD",
              room: dbBatch.description || "Room A"
            };
          }
          const count = dbBatch.studentCount !== undefined ? dbBatch.studentCount : (Array.isArray(dbBatch.students) ? dbBatch.students.length : (dbBatch._count?.students || 0));
          return {
            id: dbBatch.id,
            name: dbBatch.name || `Batch - ${dbBatch.code}`,
            level: dbBatch.level || "Level 1",
            students: count,
            timing: extra.slot || "Saturday 09:00 AM - 10:30 AM",
            room: extra.room || "Room A",
            teacher: extra.teacher || "TBD",
            status: count >= (dbBatch.maxStudents || 15) ? "Full" : "Active"
          };
        });
      }

      if (mapped.length === 0) {
        mapped = [
          { id: 1, name: "Batch Alpha", level: "Level 1 Core", students: 14, timing: "Saturday 09:00 AM - 10:30 AM", room: "Lab A", teacher: user?.name || "Teacher", status: "Active" },
          { id: 2, name: "Batch Beta", level: "Level 2 Foundations", students: 12, timing: "Mon-Wed 04:00 PM - 05:30 PM", room: "Lab B", teacher: user?.name || "Teacher", status: "Active" },
          { id: 3, name: "Batch Gamma", level: "Level 3 Advanced", students: 16, timing: "Sunday 10:00 AM - 11:30 AM", room: "Lab A", teacher: user?.name || "Teacher", status: "Full" }
        ];
      }
      setBatches(mapped);

      // Fetch batch requests
      const reqRes = await api.batchRequests.getTeacherRequests().catch(() => null);
      if (reqRes && reqRes.data && Array.isArray(reqRes.data)) {
        setRequests(reqRes.data);
      }
    } catch (error) {
      console.error("Failed to load teacher batches or requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batchName || !formData.timing) {
      alert("Please fill in batch name and timing schedule");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.batchRequests.create(formData);
      if (res && res.success) {
        alert("Batch request submitted successfully to your Franchise!");
        setIsModalOpen(false);
        setFormData({
          batchName: '',
          level: 'Level 1',
          timing: 'Mon-Wed 09:00 AM - 10:30 AM',
          mode: 'Offline',
          maxStudents: 15,
          remarks: ''
        });
        setActiveTab('requests');
        fetchData();
      }
    } catch (err) {
      console.error("Failed to submit request", err);
      alert(err.message || "Failed to submit batch request");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    return batch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           batch.level.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRequests = requests.filter(req => {
    return req.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           req.level.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">MY BATCH ALLOCATIONS</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Manage your assigned learning cohorts and request new batch allocations from Franchise.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine self-start sm:self-center"
        >
          <Plus size={14} />
          <span>Request New Batch</span>
        </button>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Active Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <span>My Batch Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl w-full sm:w-72">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search batch or level..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* ACTIVE BATCHES TAB */}
      {activeTab === 'batches' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                  <th className="py-4 px-6">Batch Name</th>
                  <th className="py-4 px-6">Curriculum Track</th>
                  <th className="py-4 px-6">Schedule Time</th>
                  <th className="py-4 px-6">Students Assigned</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
                    {/* Name */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block">{batch.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: BTCH-00{batch.id} • {batch.room}</span>
                    </td>
                    
                    {/* Level */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 bg-primary/5 text-primary dark:bg-primary-light/20 dark:text-cream px-2.5 py-1 rounded-lg text-[10px] font-bold border border-primary/10 dark:border-primary-light/35">
                        <BookOpen size={10} />
                        {batch.level}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        <Clock size={12} className="text-slate-400" />
                        {batch.timing}
                      </div>
                    </td>

                    {/* Students */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{batch.students}</span>
                      <span className="text-slate-450 font-normal"> students</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        batch.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/40'
                          : 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-450 dark:border-amber-900/40'
                      }`}>
                        {batch.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/dashboard/teacher/progress?batch=${encodeURIComponent(batch.name)}`}
                          className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/dashboard/teacher/attendance?batch=${encodeURIComponent(batch.name)}`}
                          className="inline-flex items-center gap-1 bg-primary/5 hover:bg-primary/10 dark:bg-primary-light/20 dark:hover:bg-primary-light/30 border border-primary/20 dark:border-primary-light/35 text-primary dark:text-cream px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <CalendarDays size={12} />
                          <span>Attendance</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBatches.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
              No active cohorts found matching your search.
            </div>
          )}
        </div>
      )}

      {/* MY BATCH REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                  <th className="py-4 px-6">Requested Batch</th>
                  <th className="py-4 px-6">Level</th>
                  <th className="py-4 px-6">Timing Slot</th>
                  <th className="py-4 px-6">Mode & Cap</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                      {req.batchName}
                      <span className="block text-[10px] text-slate-400 font-mono">REQ-00{req.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[10px] border border-indigo-200">
                        {req.level}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {req.timing}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{req.mode || 'Offline'}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Max: {req.maxStudents || 15} pupils</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {req.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <Clock3 size={11} /> Pending Franchise Approval
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle size={11} /> Approved & Created
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertCircle size={11} /> Request Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs">
                      {req.status === 'REJECTED' && req.rejectionReason ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">Reason: {req.rejectionReason}</span>
                      ) : (
                        <span>{req.remarks || 'No notes provided'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
              No batch requests found. Click "Request New Batch" above to submit one to your Franchise.
            </div>
          )}
        </div>
      )}

      {/* REQUEST BATCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-slate-800 dark:text-slate-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><BookOpen size={20} /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 tracking-tight">REQUEST BATCH ALLOCATION</h3>
                <p className="text-[11px] text-slate-400">Submit proposed cohort slot to Franchise for approval.</p>
              </div>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">Proposed Batch Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Batch Level 1 Morning" 
                  value={formData.batchName} 
                  onChange={(e) => setFormData({...formData, batchName: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">Abacus Level</label>
                  <select 
                    value={formData.level} 
                    onChange={(e) => setFormData({...formData, level: e.target.value})} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">Delivery Mode</label>
                  <select 
                    value={formData.mode} 
                    onChange={(e) => setFormData({...formData, mode: e.target.value})} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">Preferred Schedule & Timing</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Mon-Wed 09:00 AM - 10:30 AM" 
                  value={formData.timing} 
                  onChange={(e) => setFormData({...formData, timing: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">Target Max Students</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  required 
                  value={formData.maxStudents} 
                  onChange={(e) => setFormData({...formData, maxStudents: Number(e.target.value)})} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-mono" 
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">Remarks / Notes for Franchise</label>
                <textarea 
                  rows="2"
                  placeholder="Additional details regarding classroom requirement or student inquiry list..." 
                  value={formData.remarks} 
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white font-bold cursor-pointer hover:opacity-95 transition-all shadow-md shadow-[#FF6B2B]/20 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}