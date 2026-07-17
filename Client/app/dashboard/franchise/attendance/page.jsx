"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Check, X, Calendar, Search, Users, UserCheck, UserX, 
  Star, Save, BookOpen, ChevronRight, Award, Download 
} from "lucide-react";

export default function AttendanceProgress() {
  const [selectedBatch, setSelectedBatch] = useState("BTC-101");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Hydration Error टाळण्यासाठी तारीख क्लायंट साइडला सेट केली
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Mock Students Data with Attendance and Progress State
  const [students, setStudents] = useState([
    { id: "STU-881", name: "Amit Kulkarni", batchId: "BTC-101", status: "Present", speed: 4, accuracy: 5, homework: true },
    { id: "STU-882", name: "Sneha Patil", batchId: "BTC-101", status: "Present", speed: 5, accuracy: 4, homework: true },
    { id: "STU-883", name: "Vedant Joshi", batchId: "BTC-101", status: "Absent", speed: 3, accuracy: 3, homework: false },
    { id: "STU-884", name: "Anjali Nair", batchId: "BTC-102", status: "Present", speed: 5, accuracy: 5, homework: true },
    { id: "STU-885", name: "Parth Deshmukh", batchId: "BTC-102", status: "Pending", speed: 4, accuracy: 4, homework: false },
  ]);

  const batches = [
    { id: "BTC-101", name: "Sat | 04:00 PM (Level 1)" },
    { id: "BTC-102", name: "Sat | 05:30 PM (Level 4)" },
  ];

  // Toggle Attendance Status
  const toggleAttendance = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  // Handle Progress Rating Change
  const handleRatingChange = (id, field, value) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Handle Homework Toggle
  const toggleHomework = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, homework: !s.homework } : s));
  };

  // Filtered Roster Based on Batch and Search
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesBatch = s.batchId === selectedBatch;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBatch && matchesSearch;
    });
  }, [students, selectedBatch, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const batchStudents = students.filter(s => s.batchId === selectedBatch);
    return {
      total: batchStudents.length,
      present: batchStudents.filter(s => s.status === "Present").length,
      absent: batchStudents.filter(s => s.status === "Absent").length,
    };
  }, [students, selectedBatch]);

  // 📥 Native Chrome Excel/CSV Download Engine
  const downloadAttendanceExcel = () => {
    const headers = ["Student ID", "Student Name", "Batch ID", "Attendance Status", "Abacus Speed (1-5)", "Formula Accuracy (1-5)", "Homework Status"];
    
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`, 
      s.batchId,
      s.status,
      s.speed,
      s.accuracy,
      s.homework ? "Completed" : "Incomplete"
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

  const handleSaveLogs = () => {
    alert(`Attendance & Progress logs for date ${selectedDate} synced successfully!`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto font-sans min-h-screen">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Attendance & <span className="text-indigo-600 dark:text-indigo-400">Progress Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mark daily rosters, evaluate calculation velocity, and audit curriculum performance.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={downloadAttendanceExcel} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
            <Download size={14} /><span>Download Batch Excel</span>
          </button>
          <button onClick={handleSaveLogs} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white shadow-sm transition-all cursor-pointer">
            <Save size={14} /><span>Save Session Logs</span>
          </button>
        </div>
      </div>

      {/* Control Filters Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div>
          <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Select Class Batch</label>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full bg-white dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500">
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
            <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-550" size={14} />
            <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* Live Roster Micro Metrics */}
      <div className="grid grid-cols-3 gap-4 max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Enrolled</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{metrics.total}</div>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-205 dark:border-emerald-900 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-bold">Present</div>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-450 mt-0.5">{metrics.present}</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-205 dark:border-rose-900 rounded-xl p-3 text-center shadow-sm">
          <div className="text-[10px] font-mono text-rose-800 dark:text-rose-400 uppercase font-bold">Absent</div>
          <div className="text-lg font-black text-rose-700 dark:text-rose-455 mt-0.5">{metrics.absent}</div>
        </div>
      </div>

      {/* Main Interactive Grid / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                <th className="py-4 px-6">UID</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6 text-center">Attendance Action</th>
                <th className="py-4 px-6 text-center">Abacus Speed (1-5)</th>
                <th className="py-4 px-6 text-center">Formula Accuracy (1-5)</th>
                <th className="py-4 px-6 text-center">Homework Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{stu.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{stu.name}</td>
                  
                  {/* Attendance Selector Buttons */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button type="button" onClick={() => toggleAttendance(stu.id, "Present")} className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        stu.status === "Present" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}><Check size={12} /> Present</button>
                      <button type="button" onClick={() => toggleAttendance(stu.id, "Absent")} className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        stu.status === "Absent" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}><X size={12} /> Absent</button>
                    </div>
                  </td>

                  {/* Speed Star Matrix */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button key={val} type="button" onClick={() => handleRatingChange(stu.id, "speed", val)} className="cursor-pointer transition-transform hover:scale-110">
                          <Star size={14} className={val <= stu.speed ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-slate-700"} />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Accuracy Star Matrix */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button key={val} type="button" onClick={() => handleRatingChange(stu.id, "accuracy", val)} className="cursor-pointer transition-transform hover:scale-110">
                          <Star size={14} className={val <= stu.accuracy ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-slate-700"} />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Homework Toggle Checkbox */}
                  <td className="py-4 px-6 text-center">
                    <button type="button" onClick={() => toggleHomework(stu.id)} className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider font-mono transition-all cursor-pointer border ${
                      stu.homework ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" : "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900"
                    }`}>
                      {stu.homework ? "Completed" : "Incomplete"}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}