// src/app/dashboard/teacher/exams/page.jsx
"use client";

import React, { useState } from 'react';
import { 
  FileSpreadsheet, Plus, Search, Calendar, 
  Trash2, Edit, Award, UserCheck, X, CheckSquare 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BATCH_ROSTERS = {
  'Batch Alpha': [
    { id: '101', name: 'Abhishek Kulkarni' },
    { id: '102', name: 'Pranjal Patil' },
    { id: '103', name: 'Siddharth Joshi' }
  ],
  'Batch Beta': [
    { id: '104', name: 'Rohan Deshmukh' },
    { id: '105', name: 'Neha Patel' }
  ]
};

export default function TeacherExamsPage() {
  const [exams, setExams] = useState([
    { 
      id: 'EX-501', 
      name: 'Level 1 Midterm Exam', 
      batch: 'Batch Alpha', 
      level: 'Level 1 Core', 
      date: '2026-06-20', 
      time: '10:00', 
      maxMarks: 100, 
      creator: 'Teacher Admin', 
      status: 'Pending Review', 
      studentMarks: { '101': 88, '102': 92, '103': 0 } 
    },
    { 
      id: 'EX-502', 
      name: 'Oral Speed Arithmetic Drill', 
      batch: 'Batch Alpha', 
      level: 'Level 1 Core', 
      date: '2026-07-05', 
      time: '11:30', 
      maxMarks: 50, 
      creator: 'Teacher Admin', 
      status: 'Scheduled', 
      studentMarks: {} 
    },
    { 
      id: 'EX-503', 
      name: 'Level 3 Advanced Assessment', 
      batch: 'Batch Beta', 
      level: 'Level 3 Advanced', 
      date: '2026-06-24', 
      time: '14:00', 
      maxMarks: 100, 
      creator: 'Aman Sharma', 
      status: 'Published', 
      studentMarks: { '104': 95, '105': 89 } 
    }
  ]);

  // Modal controls
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    batch: 'Batch Alpha',
    level: 'Level 1 Core',
    date: '',
    time: '10:00',
    maxMarks: 100,
    creator: 'Teacher Admin',
    status: 'Scheduled',
    studentMarks: {}
  });

  const [activeMarksExam, setActiveMarksExam] = useState(null);
  const [tempMarks, setTempMarks] = useState({});

  const handleOpenCreate = () => {
    setFormData({
      id: `EX-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      batch: 'Batch Alpha',
      level: 'Level 1 Core',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      maxMarks: 100,
      creator: 'Teacher Admin',
      status: 'Scheduled',
      studentMarks: {}
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateExam = (e) => {
    e.preventDefault();
    setExams(prev => [formData, ...prev]);
    setIsCreateModalOpen(false);
    confetti({
      particleCount: 60,
      spread: 40,
      origin: { y: 0.8 }
    });
  };

  const handleDeleteExam = (examId) => {
    if (confirm(`Are you sure you want to delete the exam record?`)) {
      setExams(prev => prev.filter(ex => ex.id !== examId));
    }
  };

  const handleOpenMarks = (exam) => {
    setActiveMarksExam(exam);
    const studentsList = BATCH_ROSTERS[exam.batch] || [];
    const initialMarks = {};
    studentsList.forEach(s => {
      initialMarks[s.id] = exam.studentMarks[s.id] !== undefined ? exam.studentMarks[s.id] : '';
    });
    setTempMarks(initialMarks);
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    if (!activeMarksExam) return;

    const updatedStudentMarks = {};
    Object.keys(tempMarks).forEach(key => {
      updatedStudentMarks[key] = Number(tempMarks[key]) || 0;
    });

    setExams(prev => prev.map(ex => {
      if (ex.id === activeMarksExam.id) {
        return {
          ...ex,
          status: 'Pending Review',
          studentMarks: updatedStudentMarks
        };
      }
      return ex;
    }));
    setIsMarksModalOpen(false);
    alert("Marks Saved. Pending Publish.");
  };

  const handlePublishResults = (examId) => {
    setExams(prev => prev.map(ex => {
      if (ex.id === examId) {
        return { ...ex, status: 'Published' };
      }
      return ex;
    }));
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    alert("Results successfully published to Student consoles!");
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">EXAMINATIONS & EVALUATIONS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Configure tests, input scores, and publish marks sheets to students.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
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
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
                  
                  {/* Status Badge */}
                  <td className="py-4 px-6 w-36">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      exam.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                        : exam.status === 'Pending Review'
                        ? 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                        : 'bg-indigo-50 text-indigo-750 border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40'
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
                          onClick={() => handlePublishResults(exam.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        >
                          <Award size={12} />
                          <span>Publish</span>
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteExam(exam.id)}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 dark:border-rose-900/50 dark:text-rose-400 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-xs font-bold text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Batch</label>
                  <select 
                    value={formData.batch}
                    onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="Batch Alpha">Batch Alpha</option>
                    <option value="Batch Beta">Batch Beta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Curriculum Track</label>
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="Level 1 Core">Level 1 Core</option>
                    <option value="Level 2 Foundations">Level 2 Foundations</option>
                    <option value="Level 3 Advanced">Level 3 Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Max Marks</label>
                  <input 
                    type="number" 
                    required
                    value={formData.maxMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: Number(e.target.value) || 100 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-xs text-slate-850 dark:text-slate-100"
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
                  className="bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-755 cursor-pointer shadow-md"
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
                {(BATCH_ROSTERS[activeMarksExam.batch] || []).map(student => (
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
                        className="w-16 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-center rounded-lg p-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">/ {activeMarksExam.maxMarks}</span>
                    </div>
                  </div>
                ))}
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
                  className="bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-755 cursor-pointer shadow-md"
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