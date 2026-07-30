"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Check, X, Calendar, Search, Users, UserCheck, UserX, 
  Save, Download, Loader2
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function AttendanceProgress() {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Set date on mount
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Fetch all batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.batches.getAll().catch(() => null);
        let mappedBatches = [];
        const rawList = (res && res.data) || (res && res.batches) || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList)) {
          mappedBatches = rawList.map(b => ({
            id: String(b.id),
            name: b.code ? `${b.name} (${b.code})` : b.name,
          }));
        }

        setBatches(mappedBatches);
        if (mappedBatches.length > 0) {
          setSelectedBatch(mappedBatches[0].id);
        }
      } catch (err) {
        console.warn("Failed to fetch batches:", err.message);
        setBatches([]);
      }
    };
    fetchBatches();
  }, []);

  // Fetch roster and existing attendance
  useEffect(() => {
    if (!selectedBatch || !selectedDate) return;

    const loadRosterAndAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get the roster of students in the batch
        const batchRes = await api.batches.getById(Number(selectedBatch)).catch(() => null);
        if (batchRes && (batchRes.success || batchRes.data)) {
          const batchData = batchRes.data || batchRes;
          const batchStudents = batchData.students || [];

          // Get existing attendance for this batch on this date
          let existingRecords = [];
          try {
            const attRes = await api.attendance.getByBatchAndDate(Number(selectedBatch), selectedDate).catch(() => null);
            if (attRes && attRes.success && attRes.attendance) {
              existingRecords = attRes.attendance;
            }
          } catch (e) {
            console.warn("No existing attendance records found for this date", e);
          }

          const mappedStudents = batchStudents.map(student => {
            const record = existingRecords.find(r => r.studentId === student.id);
            return {
              id: student.id.toString(),
              rollNo: student.rollNo || `STU-${student.id}`,
              name: student.name,
              status: record ? (record.status === 'PRESENT' ? 'Present' : record.status === 'ABSENT' ? 'Absent' : 'Leave') : 'Present',
              notes: record ? record.remarks || '' : '',
              attendanceRecordId: record ? record.id : null
            };
          });
          setStudents(mappedStudents);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.warn("Failed to load roster or attendance records:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRosterAndAttendance();
  }, [selectedBatch, selectedDate]);

  // Toggle Attendance Status
  const toggleAttendance = (id, newStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  // Handle Notes Change
  const handleNotesChange = (id, value) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, notes: value } : s));
  };

  // Filtered Roster Based on Search
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      return s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [students, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    return {
      total: students.length,
      present: students.filter(s => s.status === "Present").length,
      absent: students.filter(s => s.status === "Absent").length,
      leave: students.filter(s => s.status === "Leave").length,
    };
  }, [students]);

  // 📥 Download CSV
  const downloadAttendanceExcel = () => {
    const headers = ["Student ID", "Student Name", "Roll No", "Attendance Status", "Remarks"];
    
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`, 
      s.rollNo,
      s.status,
      `"${s.notes || ''}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Batch_${selectedBatch}_${selectedDate}.csv`);
    document.body.appendChild(link);
    
    link.click(); 
    document.body.removeChild(link);
  };

  const handleSaveLogs = async () => {
    if (!selectedBatch) return;
    setIsSubmitting(true);
    try {
      const teacherId = user?.id || 1; 

      const promises = students.map(student => {
        const payload = {
          status: student.status === 'Present' ? 'PRESENT' : student.status === 'Absent' ? 'ABSENT' : 'LEAVE',
          remarks: student.notes || ''
        };

        if (student.attendanceRecordId) {
          return api.attendance.update(student.attendanceRecordId, payload);
        } else {
          return api.attendance.mark({
            studentId: Number(student.id),
            teacherId: Number(teacherId),
            batchId: Number(selectedBatch),
            status: payload.status,
            remarks: payload.remarks
          });
        }
      });

      await Promise.all(promises);
      alert("Attendance Logs Successfully Synchronized with Cloud Database.");
      
      // Reload roster to fetch new attendanceRecordIds
      const batchRes = await api.batches.getById(Number(selectedBatch));
      if (batchRes && batchRes.success && batchRes.data) {
        const batchStudents = batchRes.data.students || [];
        const attRes = await api.attendance.getByBatchAndDate(Number(selectedBatch), selectedDate);
        const existingRecords = (attRes && attRes.success && attRes.attendance) ? attRes.attendance : [];

        const mappedStudents = batchStudents.map(student => {
          const record = existingRecords.find(r => r.studentId === student.id);
          return {
            id: student.id.toString(),
            rollNo: student.rollNo || `STU-${student.id}`,
            name: student.name,
            status: record ? (record.status === 'PRESENT' ? 'Present' : record.status === 'ABSENT' ? 'Absent' : 'Leave') : 'Present',
            notes: record ? record.remarks || '' : '',
            attendanceRecordId: record ? record.id : null
          };
        });
        setStudents(mappedStudents);
      }
    } catch (err) {
      console.error("Failed to save session logs:", err);
      alert("Error saving session logs. Please check server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto font-sans min-h-screen">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">ATTENDANCE & PROGRESS TRACKER</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Mark daily rosters, evaluate calculation velocity, and audit curriculum performance.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={downloadAttendanceExcel} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5">
            <Download size={14} /><span>Download CSV</span>
          </button>
          <button onClick={handleSaveLogs} disabled={isSubmitting} className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine disabled:opacity-75">
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Session Logs</span>
          </button>
        </div>
      </div>

      {/* Control Filters Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div>
          <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Select Class Batch</label>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500">
            <option value="">-- Select Batch --</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Session Log Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-555" size={14} />
            <input type="text" placeholder="Search by name or roll number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 text-xs font-bold text-red-700 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Live Roster Micro Metrics */}
      <div className="grid grid-cols-4 gap-4 max-w-lg">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Enrolled</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{metrics.total}</div>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-205 dark:border-emerald-900 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-450 uppercase font-bold">Present</div>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-450 mt-0.5">{metrics.present}</div>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-205 dark:border-rose-900 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-rose-800 dark:text-rose-450 uppercase font-bold">Absent</div>
          <div className="text-lg font-black text-rose-700 dark:text-rose-455 mt-0.5">{metrics.absent}</div>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-205 dark:border-amber-900 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-amber-800 dark:text-amber-400 uppercase font-bold">Leave</div>
          <div className="text-lg font-black text-amber-700 dark:text-amber-455 mt-0.5">{metrics.leave}</div>
        </div>
      </div>

      {/* Main Interactive Grid / Table */}
      {selectedBatch ? (
        loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-xs text-slate-400 dark:text-slate-550 font-bold flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <span>Loading batch roster & logs...</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    <th className="py-4 px-6 w-32">UID / Roll No</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6 text-center">Attendance Action</th>
                    <th className="py-4 px-6">Session Remarks / Teacher Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-4 px-6 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{stu.rollNo}</td>
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{stu.name}</td>
                        
                        {/* Attendance Selector Buttons */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button type="button" onClick={() => toggleAttendance(stu.id, "Present")} className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                              stu.status === "Present" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}><Check size={12} /> Present</button>
                            <button type="button" onClick={() => toggleAttendance(stu.id, "Absent")} className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                              stu.status === "Absent" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}><X size={12} /> Absent</button>
                            <button type="button" onClick={() => toggleAttendance(stu.id, "Leave")} className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                              stu.status === "Leave" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}><Check size={12} /> Leave</button>
                          </div>
                        </td>

                        {/* Remarks Input */}
                        <td className="py-4 px-6 pr-8">
                          <input 
                            type="text"
                            value={stu.notes}
                            onChange={(e) => handleNotesChange(stu.id, e.target.value)}
                            placeholder="Performance/attendance remarks..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-450 dark:text-slate-550">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
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
  );
}