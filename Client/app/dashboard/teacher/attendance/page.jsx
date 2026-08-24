// src/app/dashboard/teacher/attendance/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ChevronRight, Download, Users, FileSpreadsheet, Loader2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [history] = useState([
    { date: '2026-06-27', batch: 'Batch Alpha (Saturday)', present: 13, absent: 1, rate: '92.8%' },
    { date: '2026-06-24', batch: 'Batch Beta (Mon-Wed)', present: 12, absent: 0, rate: '100%' },
    { date: '2026-06-22', batch: 'Batch Beta (Mon-Wed)', present: 10, absent: 2, rate: '83.3%' },
    { date: '2026-06-21', batch: 'Batch Gamma (Sunday)', present: 15, absent: 1, rate: '93.7%' }
  ]);

  // Load batches on mount
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await api.batches.getAll().catch(() => null);
        let mappedBatches = [];
        if (res && res.data && Array.isArray(res.data)) {
          mappedBatches = res.data.map(b => ({
            id: b.id.toString(),
            name: `${b.name} (${b.code || 'Batch'})`,
            studentsCount: b.students?.length || 0
          }));
        } else if (res && Array.isArray(res)) {
          mappedBatches = res.map(b => ({
            id: b.id.toString(),
            name: `${b.name} (${b.code || 'Batch'})`,
            studentsCount: b.students?.length || 0
          }));
        }

        if (mappedBatches.length === 0) {
          mappedBatches = [
            { id: "1", name: "Batch Alpha (Saturday)", studentsCount: 14 },
            { id: "2", name: "Batch Beta (Mon-Wed)", studentsCount: 12 },
            { id: "3", name: "Batch Gamma (Sunday)", studentsCount: 16 },
            { id: "4", name: "Batch Delta (Tue-Thu)", studentsCount: 10 }
          ];
        }

        setBatches(mappedBatches);
        if (mappedBatches.length > 0) {
          setSelectedBatch(mappedBatches[0].id);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
      }
    };
    loadBatches();
  }, []);

  // Hook to pull batch query from URI
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const batchParam = params.get('batch');
    if (batchParam && batches.length > 0) {
      const found = batches.find(b => b.name.toLowerCase().includes(batchParam.toLowerCase()));
      if (found) setSelectedBatch(found.id);
    }
  }, [batches]);

  // Load roster and existing attendance records
  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }

    const loadRosterAndAttendance = async () => {
      try {
        setLoading(true);
        // Get the roster of students in the batch
        const batchRes = await api.batches.getById(Number(selectedBatch)).catch(() => null);
        if (batchRes && (batchRes.success || batchRes.data)) {
          const batchData = batchRes.data || batchRes;
          const batchStudents = batchData.students || [];

          // Get existing attendance for this batch on this date
          let existingRecords = [];
          try {
            const attRes = await api.attendance.getByBatchAndDate(Number(selectedBatch), attendanceDate).catch(() => null);
            if (attRes && attRes.success && attRes.attendance) {
              existingRecords = attRes.attendance;
            }
          } catch (e) {
            console.log("No existing attendance records found for this date", e);
          }

          const mappedStudents = batchStudents.map(student => {
            const record = existingRecords.find(r => Number(r.studentId) === Number(student.id));
            return {
              id: student.id.toString(),
              rollNo: student.rollNo || `STU-${student.id}`,
              name: student.name,
              isPresent: record ? record.status === 'PRESENT' : true,
              pages: record ? 5 : 0,
              notes: record ? record.remarks || '' : '',
              attendanceRecordId: record ? record.id : null
            };
          });
          setStudents(mappedStudents);
        } else {
          setStudents([
            { id: "101", rollNo: "STU-001", name: "Aarav Sharma", isPresent: true, pages: 5, notes: "Very active today" },
            { id: "102", rollNo: "STU-002", name: "Ananya Patel", isPresent: true, pages: 4, notes: "" },
            { id: "103", rollNo: "STU-003", name: "Devansh Verma", isPresent: false, pages: 0, notes: "Informed sick leave" },
            { id: "104", rollNo: "STU-004", name: "Ishani Gupta", isPresent: true, pages: 6, notes: "Completed extra level" }
          ]);
        }
      } catch (err) {
        console.warn("Failed to load roster or attendance records:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRosterAndAttendance();
  }, [selectedBatch, attendanceDate]);

  const toggleAttendance = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const nextPresent = !s.isPresent;
        return { ...s, isPresent: nextPresent, pages: nextPresent ? 5 : 0 };
      }
      return s;
    }));
  };

  const handlePageChange = (id, val) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, pages: parseInt(val) || 0 } : s));
  };

  const handleNotesChange = (id, val) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, notes: val } : s));
  };

  const downloadExcel = () => {
    let csv = "Roll No,Student Name,AttendanceStatus,Workbook Pages,Remarks\n";
    students.forEach(s => {
      csv += `${s.rollNo},${s.name},${s.isPresent ? 'Present' : 'Absent'},${s.pages},${s.notes}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Attendance_${selectedBatch}_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmitting(true);
    try {
      const teacherId = user?.teacher?.id || 1; // fallback to 1 if Admin
      
      const promises = students.map(student => {
        const payload = {
          status: student.isPresent ? 'PRESENT' : 'ABSENT',
          remarks: student.notes || ''
        };
        
        if (student.attendanceRecordId) {
          return api.attendance.update(student.attendanceRecordId, payload);
        } else {
          return api.attendance.mark({
            studentId: Number(student.id),
            teacherId: Number(teacherId),
            batchId: Number(selectedBatch),
            status: student.isPresent ? 'PRESENT' : 'ABSENT',
            remarks: student.notes || ''
          });
        }
      });

      await Promise.all(promises);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 }
      });
      alert("Attendance Logs Successfully Synchronized with Cloud Database.");
      
      // Reload roster to fetch new attendanceRecordIds
      const batchRes = await api.batches.getById(Number(selectedBatch));
      if (batchRes && batchRes.success && batchRes.data) {
        const batchStudents = batchRes.data.students || [];
        const attRes = await api.attendance.getByBatchAndDate(Number(selectedBatch), attendanceDate);
        const existingRecords = (attRes && attRes.success && attRes.attendance) ? attRes.attendance : [];

        const mappedStudents = batchStudents.map(student => {
          const record = existingRecords.find(r => Number(r.studentId) === Number(student.id));
          return {
            id: student.id.toString(),
            rollNo: student.rollNo || `STU-${student.id}`,
            name: student.name,
            isPresent: record ? record.status === 'PRESENT' : true,
            pages: record ? 5 : 0,
            notes: record ? record.remarks || '' : '',
            attendanceRecordId: record ? record.id : null
          };
        });
        setStudents(mappedStudents);
      }
    } catch (err) {
      console.error("Failed to sync attendance logs:", err);
      alert("Error syncing attendance logs. Please check server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">ATTENDANCE MODULE</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Select a batch, track attendees, and log curriculum pages completed.</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Calendar size={14} />
          <span>{showHistory ? "Back to Tracker" : "Attendance Logs History"}</span>
        </button>
      </div>

      {showHistory ? (
        /* HISTORY MODULE */
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Historical Session Logs</h4>
          <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(45,27,105,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                    <th className="py-4 px-6">Session Date</th>
                    <th className="py-4 px-6">Batch Allocated</th>
                    <th className="py-4 px-6">Present Count</th>
                    <th className="py-4 px-6">Absent Count</th>
                    <th className="py-4 px-6">Attendance Ratio</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-355">
                  {history.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-slate-100">{h.date}</td>
                      <td className="py-4 px-6 text-slate-800 dark:text-slate-300">{h.batch}</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold font-mono">{h.present}</td>
                      <td className="py-4 px-6 text-rose-500 font-bold font-mono">{h.absent}</td>
                      <td className="py-4 px-6">
                        <span className="bg-primary/5 text-primary dark:bg-primary-light/20 dark:text-cream px-2.5 py-0.5 rounded-lg font-mono font-bold">
                          {h.rate}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-xs text-accent dark:text-accent font-bold hover:underline cursor-pointer">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ATTENDANCE TRACKER */
        <div className="space-y-6">
          {/* FILTER CRITERIA */}
          <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-center justify-between shadow-[0_2px_20px_rgba(45,27,105,0.06)]">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Select Class Cohort</span>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-accent cursor-pointer text-slate-700 dark:text-slate-200 w-full sm:w-60"
                >
                  <option value="">-- Select Class --</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Select Session Date</span>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)} 
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-accent text-slate-700 dark:text-slate-200 w-full sm:w-48"
                />
              </div>
            </div>

            {selectedBatch && (
              <div className="flex gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0">
                <button 
                  onClick={downloadExcel}
                  className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={14} />
                  <span>Download CSV</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Submit Logs</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* STUDENT DATA */}
          {selectedBatch ? (
            loading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-xs text-slate-400 dark:text-slate-550 font-bold flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-accent" size={24} />
                <span>Loading batch roster & logs...</span>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(45,27,105,0.06)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                        <th className="py-4 px-6 w-32">Attendance</th>
                        <th className="py-4 px-6">Roll & Student Details</th>
                        <th className="py-4 px-6 w-40">Bead Pages Completed</th>
                        <th className="py-4 px-6">Session Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                          
                          {/* Toggle Status Button */}
                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleAttendance(student.id)}
                              className={`w-28 text-center py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-colors border cursor-pointer ${
                                student.isPresent 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40' 
                                  : 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/40'
                              }`}
                            >
                              {student.isPresent ? '● PRESENT' : '○ ABSENT'}
                            </button>
                          </td>

                          {/* Name Info */}
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block">{student.name}</span>
                            <span className="text-[10px] text-slate-450 font-mono">Roll: {student.rollNo || `STU-${student.id}`}</span>
                          </td>

                          {/* Pages Input */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                disabled={!student.isPresent}
                                value={student.isPresent ? student.pages : 0} 
                                onChange={(e) => handlePageChange(student.id, e.target.value)}
                                className="w-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center rounded-xl p-1.5 text-xs font-bold focus:outline-none focus:border-accent disabled:opacity-50 text-slate-800 dark:text-slate-100"
                              />
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">pages</span>
                            </div>
                          </td>

                          {/* Remarks Input */}
                          <td className="py-4 px-6 pr-8">
                            <input 
                              type="text"
                              disabled={!student.isPresent}
                              value={student.isPresent ? student.notes : 'Absent'}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              placeholder="Add student performance remarks..."
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-accent disabled:opacity-50 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                            />
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 text-center py-16 text-xs text-slate-400 dark:text-slate-550 rounded-2xl bg-white dark:bg-slate-900 font-semibold">
              Please select a class cohort from the dropdown menu to initialize roster tracking.
            </div>
          )}
        </div>
      )}

    </div>
  );
}