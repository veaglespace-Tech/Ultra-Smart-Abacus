// src/app/dashboard/teacher/progress/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, AwardIcon, Plus, Search, 
  ChevronRight, Sparkles, X, Target, HeartHandshake, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function TeacherProgressPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Assessment Form State
  const [marks, setMarks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [perfLevel, setPerfLevel] = useState('Satisfactory');

  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [studentsRes, batchesRes] = await Promise.all([
        api.admin.getStudents(),
        api.batches.getAll()
      ]);

      let teacherBatchIds = new Set();
      let batchIdToName = {};
      let batchIdToLevel = {};

      if (batchesRes && batchesRes.success) {
        batchesRes.data.forEach(b => {
          let extra = {};
          try {
            extra = JSON.parse(b.description || '{}');
          } catch (e) {
            extra = { teacher: "TBD" };
          }
          const teacherName = extra.teacher || "TBD";
          batchIdToName[b.id] = b.name || `Batch - ${b.code}`;
          batchIdToLevel[b.id] = b.level || "Level 1 Core";

          // If the logged-in user is the teacher of this batch
          if (user && user.name && teacherName.toLowerCase() === user.name.toLowerCase()) {
            teacherBatchIds.add(b.id);
          }
        });
      }

      if (studentsRes && studentsRes.success) {
        const mapped = studentsRes.data
          .filter(s => s.batchId && teacherBatchIds.has(s.batchId))
          .map(s => ({
            id: s.rollNo || `STU-${s.id}`,
            dbId: s.id,
            name: s.name,
            batch: batchIdToName[s.batchId] || 'Assigned',
            level: batchIdToLevel[s.batchId] || 'Level 1 Core',
            speedRating: 'Steady', // Fallback defaults
            totalPages: 120,
            accuracy: 85,
            status: 'Satisfactory'
          }));
        setStudentProgress(mapped);
      }
    } catch (error) {
      console.error("Failed to load progress details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const handleOpenAssessment = (studentId) => {
    setSelectedStudentId(studentId);
    setMarks('');
    setRemarks('');
    setPerfLevel('Satisfactory');
    setIsAssessmentModalOpen(true);
  };

  const handleSaveAssessment = (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    // Update list dynamically to simulate real persistence
    setStudentProgress(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        // Adjust values dynamically
        const newAccuracy = Math.min(100, Math.max(0, Math.round(Number(marks) || s.accuracy)));
        let newSpeed = s.speedRating;
        if (perfLevel === 'Excellent') newSpeed = 'Accelerated';
        else if (perfLevel === 'Needs Improvement') newSpeed = 'Needs Practice';
        else newSpeed = 'Steady';

        return {
          ...s,
          accuracy: newAccuracy,
          speedRating: newSpeed,
          status: perfLevel
        };
      }
      return s;
    }));

    setIsAssessmentModalOpen(false);
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  };

  const filteredProgress = studentProgress.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">PROGRESS TRACKER</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Observe bead speed, formulas accuracy, and workbook coverage metrics.</p>
        </div>
      </div>

      {/* FILTER AND QUICK ADD */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl w-full sm:w-80">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student name or cohort..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* PROGRESS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                <th className="py-4 px-6">Roll & Student Details</th>
                <th className="py-4 px-6">Current Cohort</th>
                <th className="py-4 px-6">Bead Pace Status</th>
                <th className="py-4 px-6">Accuracy Ratio</th>
                <th className="py-4 px-6">Evaluated Rating</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
              {filteredProgress.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
                  {/* Name Info */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block">{student.name}</span>
                    <span className="text-[10px] text-slate-450 font-mono">{student.id}</span>
                  </td>
                  
                  {/* Level Track */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{student.batch}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{student.level}</span>
                  </td>

                  {/* Pace Badge */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      student.speedRating === 'Excellent' || student.speedRating === 'Accelerated'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-405 dark:border-emerald-900/40'
                        : student.speedRating === 'Steady'
                        ? 'bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/30 dark:text-blue-405 dark:border-blue-900/40'
                        : 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/30 dark:text-rose-455 dark:border-rose-900/40'
                    }`}>
                      {student.speedRating}
                    </span>
                  </td>

                  {/* Accuracy */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-50">{student.accuracy}%</span>
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                        <div 
                          className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all" 
                          style={{ width: `${student.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Evaluated Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      student.status === 'Excellent'
                        ? 'bg-purple-50 text-purple-700 border-purple-250 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40'
                        : student.status === 'Satisfactory'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                        : 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                    }`}>
                      {student.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleOpenAssessment(student.id)}
                      className="bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary dark:bg-primary-light/20 dark:hover:bg-primary-light/30 dark:border-primary-light/35 dark:text-cream px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Assess</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSESSMENT INPUT MODAL */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-50 text-sm uppercase tracking-wide">ADD NEW ASSESSMENT</h3>
                <p className="text-[10px] text-slate-450 font-bold">Record progress and performance index for student {selectedStudentId}</p>
              </div>
              <button 
                onClick={() => setIsAssessmentModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              {/* Accuracy Input */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assessment Score / Accuracy (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 95"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-accent text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Performance dropdown */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Performance Rating Level</label>
                <select
                  value={perfLevel}
                  onChange={(e) => setPerfLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-accent cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <option value="Excellent">Excellent (Mastery / Fast Pace)</option>
                  <option value="Satisfactory">Satisfactory (Stable Pace)</option>
                  <option value="Needs Improvement">Needs Improvement (Requires Assistance)</option>
                </select>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Teacher Observation Remarks</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Record student strengths or visual math speed metrics..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-accent text-xs font-medium text-slate-700 dark:text-slate-350 placeholder-slate-400"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                <button 
                  type="button"
                  onClick={() => setIsAssessmentModalOpen(false)}
                  className="bg-slate-150 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine transition-all duration-300"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}