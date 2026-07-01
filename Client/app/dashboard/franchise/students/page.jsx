"use client";

import React, { useState, useMemo } from "react";
import { 
  UserPlus, GraduationCap, Users, ShieldAlert, CheckCircle2, 
  MessageSquare, Clock, Pencil, Trash, X, Save, ArrowLeft, 
  Search, Download, CheckSquare, Square, History, User
} from "lucide-react";

export default function FranchiseStudents() {
  const [students, setStudents] = useState([
    { id: "STU-99", name: "Rohan Deshmukh", level: "Level 1", teacher: "Aman Sharma", status: "Active", feeStatus: "Paid", batch: "Sat | 04:00 PM", phone: "9876543210", logs: ["Admission completed (2026-03-12)", "Fee status updated to Paid"] },
    { id: "STU-102", name: "Isha Sharma", level: "Level 2", teacher: "Neha Patel", status: "Active", feeStatus: "Pending", batch: "Sun | 10:30 AM", phone: "9545123456", logs: ["Admission completed (2026-01-15)"] },
    { id: "STU-88", name: "Aditya Patil", level: "Level 4", teacher: "Sarah Jenkins", status: "Suspended", feeStatus: "Overdue", batch: "Sat | 05:30 PM", phone: "8888777766", logs: ["Admission completed (2025-11-10)", "Account suspended due to non-payment"] },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [isViewOpen, setIsViewOpen] = useState(false); 
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [editingStudent, setEditingStudent] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterFee, setFilterFee] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [formData, setFormData] = useState({
    name: "", level: "Level 1", teacher: "Aman Sharma", status: "Active", feeStatus: "Paid", batch: "Sat | 04:00 PM", phone: ""
  });

  const metrics = useMemo(() => {
    return {
      total: students.length,
      active: students.filter(s => s.status === "Active").length,
      pendingFees: students.filter(s => s.feeStatus !== "Paid").length
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = filterLevel === "All" || student.level === filterLevel;
      const matchesFee = filterFee === "All" || student.feeStatus === filterFee;
      const matchesStatus = filterStatus === "All" || student.status === filterStatus;
      return matchesSearch && matchesLevel && matchesFee && matchesStatus;
    });
  }, [students, searchQuery, filterLevel, filterFee, filterStatus]);

  const exportToCSV = () => {
    try {
      const headers = ["Student ID", "Name", "Abacus Level", "Batch Slot", "Assigned Teacher", "Parent Contact", "Fee Status", "Account Status"];
      const rows = filteredStudents.map(s => [
        s.id, s.name, s.level, s.batch, s.teacher, s.phone, s.feeStatus, s.status
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));

      const csvContent = [headers.join(","), ...rows].join("\n");
      const encodedUri = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Students_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("DOM download blocked, using secondary fallback...", error);
      const csvContentAlt = filteredStudents.map(s => [s.id, s.name, s.level, s.batch].join(",")).join("\n");
      window.open("data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContentAlt));
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (id, e) => {
    e.stopPropagation();
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(item => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleBulkFeeMark = (status) => {
    setStudents(students.map(s => 
      selectedStudentIds.includes(s.id) ? { ...s, feeStatus: status, logs: [...s.logs, `Bulk status updated to ${status}`] } : s
    ));
    setSelectedStudentIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
        setStudents(students.map(s => s.id === editingStudent.id ? { 
        ...s, ...formData, logs: [...s.logs, `Profile updated on ${new Date().toISOString().split('T')[0]}`] 
      } : s));
      setEditingStudent(null);
    } else {
      const newId = `STU-${Math.floor(100 + Math.random() * 900)}`;
      setStudents([...students, { id: newId, ...formData, logs: [`Admission registered (${new Date().toISOString().split('T')[0]})`] }]);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter(student => student.id !== id));
      setIsViewOpen(false);
    }
  };

  const handleEdit = (student) => {
    setIsViewOpen(false);
    setEditingStudent(student);
    setFormData(student);
    setIsFormOpen(true);
  };

  const handleRowClick = (student, e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const toggleFeeStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "Paid" ? "Pending" : currentStatus === "Pending" ? "Overdue" : "Paid";
    setStudents(students.map(s => s.id === id ? { ...s, feeStatus: nextStatus, logs: [...s.logs, `Fee toggled to ${nextStatus}`] } : s));
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(prev => ({ ...prev, feeStatus: nextStatus }));
    }
  };

  const toggleAccountStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    setStudents(students.map(s => s.id === id ? { ...s, status: nextStatus, logs: [...s.logs, `Status toggled to ${nextStatus}`] } : s));
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(prev => ({ ...prev, status: nextStatus }));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", level: "Level 1", teacher: "Aman Sharma", status: "Active", feeStatus: "Paid", batch: "Sat | 04:00 PM", phone: "" });
  };

  return (
    <div className="space-y-6 w-full text-[#2c3539]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black tracking-tight text-[#1a202c] uppercase">Student Roster Hub</h2>
          <p className="text-[11px] text-[#8a9485] mt-0.5 font-medium">Enterprise-grade center analytics, automated triggers, and bulk control.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f0e6] border border-[#e2dcd0] text-[11px] font-bold rounded-lg text-[#5a6455] hover:bg-[#e2dcd0]/50 transition-all cursor-pointer">
            <Download size={13} /><span>Export CSV</span>
          </button>
          <button onClick={() => { setEditingStudent(null); resetForm(); setIsFormOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a5d4e] text-[11px] font-bold rounded-lg text-[#fcfbfa] hover:bg-[#3d4d40] transition-all cursor-pointer shadow-sm">
            <UserPlus size={13} /><span>New Admission</span>
          </button>
        </div>
      </div>

      {/* METRICS BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#8a9485]">Total Enrolled</div>
          <div className="text-xl font-black text-[#1a202c] mt-1">{metrics.total}</div>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#4a5d4e]">Active Students</div>
          <div className="text-xl font-black text-[#4a5d4e] mt-1">{metrics.active}</div>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Dues Pending</div>
          <div className="text-xl font-black text-amber-800 mt-1">{metrics.pendingFees}</div>
        </div>
      </div>

      {/* SEARCH AND CONTROL BAR */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-3 rounded-xl flex flex-col lg:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 text-[#8a9485]" size={14} />
          <input type="text" placeholder="Search by Name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#f4f0e6]/40 text-xs text-[#1a202c] rounded-lg pl-9 pr-4 py-1.5 border border-[#e2dcd0] focus:outline-none focus:border-[#4a5d4e]" />
        </div>
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto text-[11px]">
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="bg-[#fcfbfa] px-2 py-1.5 rounded-lg border border-[#e2dcd0] text-[#5a6455] font-medium focus:outline-none">
            <option value="All">All Levels</option><option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Level 4">Level 4</option>
          </select>
          <select value={filterFee} onChange={(e) => setFilterFee(e.target.value)} className="bg-[#fcfbfa] px-2 py-1.5 rounded-lg border border-[#e2dcd0] text-[#5a6455] font-medium focus:outline-none">
            <option value="All">All Fees</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#fcfbfa] px-2 py-1.5 rounded-lg border border-[#e2dcd0] text-[#5a6455] font-medium focus:outline-none">
            <option value="All">All Status</option><option value="Active">Active</option><option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* BULK SELECTION ACTION MODAL LINE */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-row items-center justify-between gap-3 shadow-sm">
          <span className="text-xs text-amber-800 font-bold font-mono">Selected: {selectedStudentIds.length} Student(s)</span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkFeeMark("Paid")} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] rounded-md cursor-pointer hover:bg-emerald-100 transition-colors">Mark Paid</button>
            <button onClick={() => handleBulkFeeMark("Overdue")} className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] rounded-md cursor-pointer hover:bg-rose-100 transition-colors">Mark Overdue</button>
            <button onClick={() => setSelectedStudentIds([])} className="text-xs text-[#8a9485] hover:text-[#1a202c] px-2 cursor-pointer font-medium">Clear</button>
          </div>
        </div>
      )}

      {/* COMPACT DATA ROSTER BOARD */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-wider text-[#7a8475]">
                <th className="py-3 px-4 w-12 text-center">
                  <button onClick={handleSelectAll} className="text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer flex items-center justify-center w-full">
                    {selectedStudentIds.length === filteredStudents.length ? <CheckSquare size={14} className="text-[#4a5d4e]" /> : <Square size={14} />}
                  </button>
                </th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6">Abacus Level</th>
                <th className="py-3 px-6">Assigned Batch</th>
                <th className="py-3 px-6">Teacher</th>
                <th className="py-3 px-6">Fee Status</th>
                <th className="py-3 px-6">Account Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dcd0]/40 text-[#2c3539] font-medium">
              {filteredStudents.map((student) => (
                <tr key={student.id} onClick={(e) => handleRowClick(student, e)} className={`hover:bg-[#f5f2eb]/30 cursor-pointer transition-colors group ${selectedStudentIds.includes(student.id) ? 'bg-[#4a5d4e]/5' : ''}`}>
                  <td className="py-3 px-4 text-center">
                    <button onClick={(e) => handleSelectStudent(student.id, e)} className="text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer flex items-center justify-center w-full">
                      {selectedStudentIds.includes(student.id) ? <CheckSquare size={14} className="text-[#4a5d4e]" /> : <Square size={14} />}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#4a5d4e] font-bold">{student.id}</td>
                  <td className="py-3 px-6 font-bold text-[#1a202c] group-hover:text-[#4a5d4e] transition-colors">{student.name}</td>
                  <td className="py-3 px-6"><span className="flex items-center gap-1.5 text-[#4a5d4e] font-bold"><GraduationCap size={14} /> {student.level}</span></td>
                  <td className="py-3 px-6"><span className="flex items-center gap-1.5 text-[#5a6455] font-mono"><Clock size={13} className="text-[#8a9485]" /> {student.batch}</span></td>
                  <td className="py-3 px-6 text-[#2c3539] font-semibold"><span className="flex items-center gap-1.5"><Users size={13} className="text-[#8a9485]" /> {student.teacher}</span></td>
                  <td className="py-3 px-6">
                    <button onClick={() => toggleFeeStatus(student.id, student.feeStatus)} className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all active:scale-95 cursor-pointer ${student.feeStatus === "Paid" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : student.feeStatus === "Pending" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200"}`}>{student.feeStatus}</button>
                  </td>
                  <td className="py-3 px-6">
                    <button onClick={() => toggleAccountStatus(student.id, student.status)} className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 border transition-all active:scale-95 cursor-pointer ${student.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                      {student.status === "Active" ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}{student.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => window.open(`https://wa.me/91${student.phone}`, "_blank")} className="p-1.5 text-[#8a9485] hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"><MessageSquare size={13} /></button>
                      <button onClick={() => handleEdit(student)} className="p-1.5 text-[#8a9485] hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(student.id)} className="p-1.5 text-[#8a9485] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP DETAILED STUDENT ACCOUNT LOG VIEW */}
      {isViewOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-md rounded-2xl p-6 shadow-xl relative overflow-hidden text-[#2c3539]">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedStudent.status === 'Active' ? 'bg-[#4a5d4e]' : 'bg-rose-600'}`} />
            <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={15} /></button>
            <div className="flex items-center gap-3.5 mb-5 mt-2">
              <div className="p-2.5 bg-[#f4f0e6] border border-[#e2dcd0] rounded-xl text-[#4a5d4e]"><User size={18} /></div>
              <div>
                <h3 className="text-sm font-black text-[#1a202c] tracking-tight">{selectedStudent.name}</h3>
                <p className="text-[10px] text-[#8a9485] font-mono uppercase tracking-wider">{selectedStudent.id} | {selectedStudent.level}</p>
              </div>
            </div>
            <div className="bg-[#f4f0e6]/50 border border-[#e2dcd0]/60 rounded-xl p-4 space-y-3 font-mono text-xs text-[#5a6455] mb-4">
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Batch Slot:</span><span className="text-[#1a202c] font-bold">{selectedStudent.batch}</span></div>
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Assigned Teacher:</span><span className="text-[#1a202c]">{selectedStudent.teacher}</span></div>
              <div className="flex justify-between items-center"><span>Parent Contact:</span><span className="text-[#1a202c]">{selectedStudent.phone}</span></div>
            </div>
            <div className="mb-5">
              <div className="text-[10px] text-[#8a9485] uppercase font-bold flex items-center gap-1 mb-2"><History size={12} /> Audit Logs:</div>
              <div className="bg-[#f4f0e6]/40 border border-[#e2dcd0] rounded-xl p-3 max-h-24 overflow-y-auto space-y-1.5 text-[11px] font-mono text-[#7a8475]">
                {selectedStudent.logs?.map((log, i) => <div key={i} className="leading-relaxed">• {log}</div>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => window.open(`https://wa.me/91${selectedStudent.phone}`, "_blank")} className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all"><MessageSquare size={13} /> WhatsApp</button>
              <button onClick={() => handleEdit(selectedStudent)} className="px-3 py-2 bg-[#f4f0e6] border border-[#e2dcd0] text-[#5a6455] rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#e2dcd0]/50 transition-all"><Pencil size={13} /> Edit Profile</button>
            </div>
            <button onClick={() => setIsViewOpen(false)} className="w-full px-4 py-2 bg-[#fcfbfa] border border-[#e2dcd0] text-[#8a9485] hover:text-[#1a202c] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"><ArrowLeft size={13} /> Close View</button>
          </div>
        </div>
      )}

      {/* POP-UP CONTROL MODAL: ADMISSION / MODIFICATION RECORD FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-md rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={15} /></button>
            <h3 className="text-xs font-black text-[#1a202c] mb-5 uppercase tracking-wider border-b border-[#e2dcd0] pb-2">{editingStudent ? `Modify Record: ${editingStudent.id}` : "Process New Admission"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#5a6455] mb-1.5 font-bold">Student Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none focus:border-[#4a5d4e]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Abacus Level</label>
                  <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full px-2 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none">
                    <option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Level 4">Level 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Batch Slot</label>
                  <select value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="w-full px-2 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none">
                    <option value="Sat | 04:00 PM">Sat | 04:00 PM</option><option value="Sat | 05:30 PM">Sat | 05:30 PM</option><option value="Sun | 10:30 AM">Sun | 10:30 AM</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Assigned Teacher</label>
                  <input type="text" value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Parent Contact</label>
                  <input type="tel" required placeholder="10 digit cell" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dcd0] mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-1.5 rounded-lg bg-[#fcfbfa] text-[#8a9485] border border-[#e2dcd0] cursor-pointer hover:text-[#1a202c] transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#4a5d4e] text-[#fcfbfa] font-bold cursor-pointer hover:bg-[#3d4d40] transition-all"><Save size={14} /><span>Commit Sync</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}