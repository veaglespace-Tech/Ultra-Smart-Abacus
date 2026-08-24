// src/app/dashboard/teacher/students/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { api } from '@/services/api';

export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, batchesRes] = await Promise.all([
        api.admin.getStudents(),
        api.batches.getAll()
      ]);

      let loadedBatches = [];
      if (batchesRes && batchesRes.success) {
        loadedBatches = batchesRes.data.map(b => ({
          dbId: b.id,
          name: b.name || `Batch - ${b.code}`,
          level: b.level || "Level 1"
        }));
        setBatches(loadedBatches);
      }

      if (studentsRes && studentsRes.success) {
        const mapped = studentsRes.data.map(s => ({
          id: s.rollNo || `STU-${s.id}`,
          dbId: s.id,
          name: s.name,
          batchId: s.batchId,
          batch: s.batch ? (s.batch.name || `Batch - ${s.batch.code}`) : 'Unassigned',
          level: s.batch ? (s.batch.level || 'Level 1 Core') : 'Level 1 Core',
          attendance: 95.8,
          progress: 75,
          email: s.email,
          phone: s.phone || 'N/A',
          enrollment: new Date(s.createdAt).toLocaleDateString()
        }));
        setStudents(mapped);
      }
    } catch (error) {
      console.error("Failed to load students and batches", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'All' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">STUDENTS ROSTER</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Observe details, enrollment milestones, and tracking parameters of all pupils.</p>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-4 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)]">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl w-full sm:w-80">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student name or roll no..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter size={14} className="text-slate-400" />
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Curriculum Levels</option>
            <option value="Level 1 Core">Level 1 Core</option>
            <option value="Level 2 Foundations">Level 2 Foundations</option>
            <option value="Level 3 Advanced">Level 3 Advanced</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(45,27,105,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                <th className="py-4 px-6">Roll Number & Student</th>
                <th className="py-4 px-6">Batch & Level</th>
                <th className="py-4 px-6">Attendance Rate</th>
                <th className="py-4 px-6">Module Progress</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block">{s.name}</span>
                    <span className="text-[10px] text-slate-450 font-mono">{s.id}</span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 dark:text-slate-300 block">{s.batch}</span>
                    <span className="text-[10px] text-accent dark:text-accent uppercase tracking-wide font-black">{s.level}</span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      {s.attendance >= 85 ? (
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      ) : (
                        <AlertTriangle size={13} className="text-amber-500 animate-pulse" />
                      )}
                      <span className={`font-mono font-bold ${s.attendance >= 85 ? 'text-slate-900 dark:text-slate-50' : 'text-amber-600 dark:text-amber-400'}`}>
                        {s.attendance}%
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 min-w-44">
                    <div className="space-y-1.5 max-w-xs">
                      <div className="flex justify-between text-[10px] text-slate-450 font-bold">
                        <span>Syllabus Covered</span>
                        <span>{s.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                        <div 
                          className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedStudent(s)}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
            No students found matching your criteria.
          </div>
        )}
      </div>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setSelectedStudent(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
              <span className="text-[10px] text-accent dark:text-accent font-extrabold tracking-widest uppercase">Student Profile Card</span>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-50 mt-0.5">{selectedStudent.name}</h3>
              <p className="text-[10px] text-slate-450 font-mono">Roll Ref: {selectedStudent.id}</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Class Cohort</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px] mt-0.5">{selectedStudent.batch}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Curriculum Level</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px] mt-0.5">{selectedStudent.level}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Attendance Rate</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px] mt-0.5">{selectedStudent.attendance}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Progress Index</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px] mt-0.5">{selectedStudent.progress}%</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2 font-medium">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Email Address</span>
                  <span className="text-slate-800 dark:text-slate-200 text-xs font-bold">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Mobile Contact</span>
                  <span className="text-slate-800 dark:text-slate-200 text-xs font-bold">{selectedStudent.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Enrollment Date</span>
                  <span className="text-slate-800 dark:text-slate-200 text-xs font-bold">{selectedStudent.enrollment}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-3">
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Reassign to Batch</label>
                <select 
                  value={selectedStudent.batchId || ''} 
                  onChange={async (e) => {
                    const newBatchId = e.target.value ? Number(e.target.value) : null;
                    try {
                      await api.admin.updateStudent(selectedStudent.dbId, { batchId: newBatchId });
                      // Reload students
                      fetchData();
                      // Update modal view
                      setSelectedStudent(prev => ({
                        ...prev,
                        batchId: newBatchId,
                        batch: newBatchId ? (batches.find(b => b.dbId === newBatchId)?.name || 'Assigned') : 'Unassigned'
                      }));
                    } catch (error) {
                      console.error("Failed to reassign batch", error);
                      alert(error.message || "Error updating student batch");
                    }
                  }}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-200 w-full"
                >
                  <option value="">-- Select Batch (Unassigned) --</option>
                  {batches.map((b) => (
                    <option key={b.dbId} value={b.dbId}>{b.name} ({b.level})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="bg-gradient-to-r from-primary to-primary-light hover:from-accent hover:to-accent-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-primary/20 transition-all duration-300"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
