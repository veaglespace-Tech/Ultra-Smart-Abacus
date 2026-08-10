// src/app/dashboard/teacher/exams/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Plus, Search, Calendar, Clock,
  Trash2, Edit, Award, UserCheck, X, CheckSquare 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function TeacherExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    batchId: '',
    level: 'Level 1 Core',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: 60,
    maxMarks: 100,
  });

  const [activeMarksExam, setActiveMarksExam] = useState(null);
  const [tempMarks, setTempMarks] = useState({});

function safeFormatDate(rawDate, secondaryRawDate = null) {
  const tryParse = (val) => {
    if (!val) return null;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
    } catch (e) {}
    return null;
  };

  return tryParse(rawDate) || tryParse(secondaryRawDate) || new Date().toISOString().split("T")[0];
}

function safeFormatISO(rawDate) {
  if (!rawDate) return new Date().toISOString();
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

  const fetchExamsAndBatches = async () => {
    setLoading(true);
    try {
      const [examRes, batchRes] = await Promise.all([
        api.exams.getAll().catch(() => null),
        api.batches.getAll().catch(() => null),
      ]);

      let fetchedBatches = [];
      if (batchRes && batchRes.data && Array.isArray(batchRes.data)) {
        fetchedBatches = batchRes.data;
      } else if (batchRes && Array.isArray(batchRes)) {
        fetchedBatches = batchRes;
      }

      const defaultBatches = [
        { id: 1, name: 'Batch Alpha', code: 'ALPHA-01' },
        { id: 2, name: 'Batch Beta', code: 'BETA-02' },
        { id: 3, name: 'Batch Gamma', code: 'GAMMA-03' },
        { id: 4, name: 'Batch Delta', code: 'DELTA-04' },
        { id: 5, name: 'Level 1 Core Evening', code: 'L1-EVE' }
      ];

      if (fetchedBatches.length === 0) {
        setBatches(defaultBatches);
      } else {
        setBatches(fetchedBatches);
      }

      if (examRes && examRes.data && Array.isArray(examRes.data)) {
        const mappedExams = examRes.data.map((ex) => {
          const studentMarksMap = {};
          (ex.results || []).forEach((r) => {
            studentMarksMap[r.studentId] = r.obtainedMarks;
          });

          return {
            id: ex.examCode || `EX-${ex.id}`,
            backendId: ex.id,
            name: ex.title,
            batch: ex.batch?.name || 'Batch',
            batchId: ex.batchId,
            level: ex.curriculumTrack || 'Level 1 Core',
            date: safeFormatDate(ex.examDate, ex.createdAt),
            time: ex.startTime || '10:00 AM',
            duration: ex.duration || 60,
            maxMarks: ex.totalMarks,
            creator: ex.teacher?.name || 'Teacher',
            status: ex.status === 'PUBLISHED' ? 'Published' : ex.status === 'RESULT_PENDING' ? 'Pending Review' : 'Scheduled',
            students: ex.batch?.students || [],
            studentMarks: studentMarksMap,
          };
        });

        setExams(mappedExams);
      }
    } catch (err) {
      console.error('Failed to load exams or batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role && (user.role.toUpperCase() === "TEACHER" || user.role.toUpperCase() === "ADMIN" || user.role.toUpperCase() === "FRANCHISE")) {
      fetchExamsAndBatches();
    } else {
      setLoading(false);
    }
  }, []);

  const handleOpenCreate = () => {
    const availableBatches = batches.length > 0 ? batches : [
      { id: 1, name: 'Batch Alpha', code: 'ALPHA-01' },
      { id: 2, name: 'Batch Beta', code: 'BETA-02' },
      { id: 3, name: 'Batch Gamma', code: 'GAMMA-03' },
      { id: 4, name: 'Batch Delta', code: 'DELTA-04' },
      { id: 5, name: 'Level 1 Core Evening', code: 'L1-EVE' }
    ];
    if (batches.length === 0) {
      setBatches(availableBatches);
    }

    setFormData({
      name: '',
      batchId: '',
      level: 'Level 1 Core',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 60,
      maxMarks: 100,
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      let selectedBatchId = Number(formData.batchId);
      if (!formData.batchId || !selectedBatchId || isNaN(selectedBatchId)) {
        if (batches.length > 0) {
          selectedBatchId = Number(batches[0].id);
        } else {
          alert('Please select a Target Batch from the list.');
          return;
        }
      }

      const formattedDate = safeFormatISO(formData.date);
      const payload = {
        title: formData.name,
        curriculumTrack: formData.level,
        examType: 'WEEKLY',
        examDate: formattedDate,
        startTime: formData.time,
        duration: Number(formData.duration) || 60,
        totalMarks: Number(formData.maxMarks),
        passingMarks: Math.round(Number(formData.maxMarks) * 0.4),
        batchId: selectedBatchId,
      };

      const res = await api.exams.create(payload);
      if (res) {
        setIsCreateModalOpen(false);
        const createdObj = res.data || res;
        if (createdObj && (createdObj.id || createdObj.title)) {
          const selectedBatchObj = batches.find((b) => Number(b.id) === Number(selectedBatchId));
          const mappedNewExam = {
            id: createdObj.examCode || `EX-${createdObj.id || Date.now()}`,
            backendId: createdObj.id || Date.now(),
            name: createdObj.title || formData.name,
            batch: createdObj.batch?.name || selectedBatchObj?.name || 'Batch',
            batchId: createdObj.batchId || selectedBatchId,
            level: createdObj.curriculumTrack || formData.level,
            date: safeFormatDate(createdObj.examDate, formData.date || ''),
            time: createdObj.startTime || formData.time,
            duration: createdObj.duration || Number(formData.duration) || 60,
            maxMarks: createdObj.totalMarks || formData.maxMarks,
            creator: createdObj.teacher?.name || 'Teacher',
            status: 'Scheduled',
            students: createdObj.batch?.students || [],
            studentMarks: {},
          };
          setExams((prev) => [mappedNewExam, ...prev.filter((ex) => ex.backendId !== mappedNewExam.backendId)]);
        }
        await fetchExamsAndBatches();
        confetti({
          particleCount: 60,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      const details = err.response?.data?.errors
        ? err.response.data.errors.map((e) => `${e.field}: ${e.message}`).join(', ')
        : (err.response?.data?.message || err.message);
      alert(`Error creating exam: ${details}`);
    }
  };

  const handleDeleteExam = async (examBackendId, examCodeId) => {
    if (confirm(`Are you sure you want to delete this exam record?`)) {
      setExams((prev) => prev.filter((ex) => ex.backendId !== examBackendId && ex.id !== examBackendId && ex.id !== examCodeId));
      try {
        const idToDelete = examBackendId || examCodeId;
        await api.exams.delete(idToDelete);
        await fetchExamsAndBatches();
      } catch (err) {
        console.error('Failed to delete exam from backend:', err);
        await fetchExamsAndBatches();
      }
    }
  };

  const handleOpenMarks = async (exam) => {
    setActiveMarksExam(exam);
    let studentsList = exam.students || [];

    // If students not attached to batch in exam record, fetch batch details
    if (studentsList.length === 0 && exam.batchId) {
      try {
        const batchRes = await api.batches.getById(exam.batchId);
        if (batchRes && batchRes.success && batchRes.data && batchRes.data.students) {
          studentsList = batchRes.data.students;
        }
      } catch (e) {
        console.error('Failed to fetch batch students:', e);
      }
    }

    const initialMarks = {};
    studentsList.forEach((s) => {
      initialMarks[s.id] = exam.studentMarks[s.id] !== undefined ? exam.studentMarks[s.id] : '';
    });

    setActiveMarksExam({ ...exam, studentsList });
    setTempMarks(initialMarks);
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!activeMarksExam) return;

    try {
      const res = await api.exams.submitMarks(activeMarksExam.backendId, tempMarks);
      if (res && res.success) {
        setIsMarksModalOpen(false);
        fetchExamsAndBatches();
        alert('Marks Saved. Pending Publish.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save marks');
    }
  };

  const handlePublishResults = async (examBackendId) => {
    try {
      const res = await api.exams.publishResults(examBackendId);
      if (res && res.success) {
        fetchExamsAndBatches();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        alert('Results successfully published to Student consoles!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish results');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">EXAMINATIONS & EVALUATIONS</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Configure tests, input scores, and publish marks sheets to students.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine"
        >
          <Plus size={14} />
          <span>New Assessment</span>
        </button>
      </div>

      {/* EXAMS LIST TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assessment Details</th>
                <th className="py-4 px-6">Target Batch</th>
                <th className="py-4 px-6">Schedule Parameters</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">
                    Loading Examination Records...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">
                    No examination records found. Click "New Assessment" to create one.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.backendId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6 w-36">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        exam.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                          : exam.status === 'Pending Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                          : 'bg-primary/5 text-primary border-primary/25 dark:bg-primary-light/20 dark:text-cream dark:border-primary-light/35'
                      }`}>
                        {exam.status === 'Published' ? '✓ Published' : exam.status === 'Pending Review' ? '⏱ Pending Review' : '📅 Scheduled'}
                      </span>
                    </td>

                    {/* Assessment Name */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block">{exam.name}</span>
                      <span className="text-[10px] text-slate-450 font-mono">{exam.level} • {exam.id}</span>
                    </td>

                    {/* Target Group */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{exam.batch}</span>
                      <span className="text-[10px] text-slate-450">Max Marks: {exam.maxMarks}</span>
                    </td>

                    {/* Schedule */}
                    <td className="py-4 px-6">
                      <div className="font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{exam.date} @ {exam.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Clock size={10} className="text-slate-400" />
                        <span>{exam.duration || 60} mins</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenMarks(exam)}
                          className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckSquare size={12} />
                          <span>Enter Marks</span>
                        </button>

                        {exam.status === 'Pending Review' && (
                          <button 
                            onClick={() => handlePublishResults(exam.backendId)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                          >
                            <Award size={12} />
                            <span>Publish</span>
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeleteExam(exam.backendId, exam.id)}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 dark:border-rose-900/50 dark:text-rose-400 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EXAM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-50 text-sm uppercase tracking-wide">New Assessment parameters</h3>
                <p className="text-[10px] text-slate-450 font-bold">Configure upcoming exams or quizzes</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-355">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Exam Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Bead Visualisation Assessment"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-accent text-xs font-bold text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Batch</label>
                  <select 
                    value={formData.batchId}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-accent cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code || 'Batch'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Curriculum Track</label>
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-accent cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="Level 1 Core">Level 1 Core</option>
                    <option value="Level 2 Foundations">Level 2 Foundations</option>
                    <option value="Level 3 Advanced">Level 3 Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-accent text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Duration (mins)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="60"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) || '' }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-accent text-xs text-slate-855 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Max Marks</label>
                  <input 
                    type="number" 
                    required
                    value={formData.maxMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: Number(e.target.value) || 100 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-accent text-xs text-slate-855 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-150 text-slate-750 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine transition-all duration-300"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER MARKS MODAL */}
      {isMarksModalOpen && activeMarksExam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-50 text-sm uppercase tracking-wide">Enter Student Marks</h3>
                <p className="text-[10px] text-slate-450 font-bold">{activeMarksExam.name} ({activeMarksExam.batch})</p>
              </div>
              <button 
                onClick={() => setIsMarksModalOpen(false)} 
                className="text-slate-400 hover:text-slate-655 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {(activeMarksExam.studentsList || activeMarksExam.students || []).length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 font-bold">No students registered in this batch.</p>
                ) : (
                  (activeMarksExam.studentsList || activeMarksExam.students || []).map(student => (
                    <div key={student.id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{student.name}</span>
                        <span className="text-[9px] text-slate-450 font-mono">ID: {student.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number"
                          min="0"
                          max={activeMarksExam.maxMarks}
                          value={tempMarks[student.id] !== undefined ? tempMarks[student.id] : ''}
                          onChange={(e) => setTempMarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                          className="w-16 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-center rounded-lg p-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-accent"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">/ {activeMarksExam.maxMarks}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                <button 
                  type="button"
                  onClick={() => setIsMarksModalOpen(false)}
                  className="bg-slate-150 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine transition-all duration-300"
                >
                  Save Scores
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}