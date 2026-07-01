// src/app/dashboard/franchise/teachers/page.jsx
"use client";

import React, { useState, useMemo } from "react";
import { 
  UserPlus, Users, ShieldAlert, CheckCircle2, 
  MessageSquare, BookOpen, Pencil, Trash, X, Save, ArrowLeft, 
  Search, Download, Plus, Layers
} from "lucide-react";

export default function FranchiseTeachers() {
  const [teachers, setTeachers] = useState([
    { id: "TCH-04", name: "Anjali Shinde", role: "Senior Trainer", status: "Active", experience: "4 Years", batches: ["Sat | 04:00 PM", "Sun | 10:30 AM"], phone: "9823456789", payrollStatus: "Processed" },
    { id: "TCH-09", name: "Prakash Joshi", role: "Assistant Coach", status: "Active", experience: "2 Years", batches: ["Sat | 05:30 PM"], phone: "9123456780", payrollStatus: "Pending" },
    { id: "TCH-11", name: "Sarah Jenkins", role: "Vedic Math Expert", status: "Inactive", experience: "5 Years", batches: [], phone: "8888999900", payrollStatus: "On Hold" }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    name: "", role: "Senior Trainer", status: "Active", experience: "", phone: "", payrollStatus: "Pending"
  });

  const metrics = useMemo(() => {
    return {
      total: teachers.length,
      active: teachers.filter(t => t.status === "Active").length,
      totalBatches: teachers.reduce((acc, t) => acc + t.batches.length, 0)
    };
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || teacher.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "All" || teacher.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchQuery, filterStatus]);

  const exportToCSV = () => {
    const headers = ["Teacher ID", "Name", "Role", "Experience", "Contact", "Assigned Batches Count", "Status"];
    const rows = filteredTeachers.map(t => [
      t.id, t.name, t.role, t.experience, t.phone, t.batches.length, t.status
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const encodedUri = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Teachers_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t));
      setEditingTeacher(null);
    } else {
      const newId = `TCH-${Math.floor(10 + Math.random() * 90)}`;
      setTeachers([...teachers, { id: newId, ...formData, batches: [] }]);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to offboard this instructor?")) {
      setTeachers(teachers.filter(t => t.id !== id));
      setIsViewOpen(false);
    }
  };

  const handleEdit = (teacher) => {
    setIsViewOpen(false);
    setEditingTeacher(teacher);
    setFormData(teacher);
    setIsFormOpen(true);
  };

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setTeachers(teachers.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    if (selectedTeacher && selectedTeacher.id === id) {
      setSelectedTeacher(prev => ({ ...prev, status: nextStatus }));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", role: "Senior Trainer", status: "Active", experience: "", phone: "", payrollStatus: "Pending" });
  };

  return (
    <div className="space-y-6 w-full text-[#2c3539]">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2dcd0] pb-4">
        <div>
          <h2 className="text-base font-black tracking-tight text-[#1a202c] uppercase">Faculty Rosters</h2>
          <p className="text-[11px] text-[#8a9485] mt-0.5 font-medium">Manage franchise instructors, core profiles, and assigned teaching logs.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f0e6] border border-[#e2dcd0] text-[11px] font-bold rounded-lg text-[#5a6455] hover:bg-[#e2dcd0]/50 transition-all cursor-pointer">
            <Download size={13} /><span>Export Faculty</span>
          </button>
          <button onClick={() => { setEditingTeacher(null); resetForm(); setIsFormOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a5d4e] text-[11px] font-bold rounded-lg text-[#fcfbfa] hover:bg-[#3d4d40] transition-all cursor-pointer shadow-sm">
            <UserPlus size={13} /><span>Onboard Instructor</span>
          </button>
        </div>
      </div>

      {/* METRICS BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#8a9485]">Total Instructors</div>
          <div className="text-xl font-black text-[#1a202c] mt-1">{metrics.total}</div>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#4a5d4e]">Active Faculty</div>
          <div className="text-xl font-black text-[#4a5d4e] mt-1">{metrics.active}</div>
        </div>
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Batches Addressed</div>
          <div className="text-xl font-black text-amber-800 mt-1">{metrics.totalBatches} Slots</div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-3 rounded-xl flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-[#8a9485]" size={14} />
          <input type="text" placeholder="Search by Instructor name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#f4f0e6]/40 text-xs text-[#1a202c] rounded-lg pl-9 pr-4 py-1.5 border border-[#e2dcd0] focus:outline-none focus:border-[#4a5d4e]" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full sm:w-40 bg-[#fcfbfa] px-2 py-1.5 rounded-lg border border-[#e2dcd0] text-[#5a6455] font-medium focus:outline-none text-[11px]">
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* TEACHERS DATA TABLE */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[10px] uppercase font-bold tracking-wider text-[#7a8475]">
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-6">Instructor</th>
                <th className="py-3 px-6">Specialization Role</th>
                <th className="py-3 px-6">Tenure / Exp</th>
                <th className="py-3 px-6">Assigned Batches</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dcd0]/40 text-[#2c3539] font-medium">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} onClick={() => { setSelectedTeacher(teacher); setIsViewOpen(true); }} className="hover:bg-[#f5f2eb]/30 cursor-pointer transition-colors group">
                  <td className="py-3 px-4 font-mono text-[#4a5d4e] font-bold">{teacher.id}</td>
                  <td className="py-3 px-6 font-bold text-[#1a202c] group-hover:text-[#4a5d4e] transition-colors">{teacher.name}</td>
                  <td className="py-3 px-6 text-[#5a6455]">{teacher.role}</td>
                  <td className="py-3 px-6 font-mono text-[#7a8475]">{teacher.experience}</td>
                  <td className="py-3 px-6">
                    <span className="flex items-center gap-1 text-[#4a5d4e] font-bold">
                      <Layers size={13} /> {teacher.batches.length} Active Batches
                    </span>
                  </td>
                  <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleStatus(teacher.id, teacher.status)} className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all active:scale-95 cursor-pointer ${teacher.status === "Active" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"}`}>{teacher.status}</button>
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => window.open(`https://wa.me/91${teacher.phone}`, "_blank")} className="p-1.5 text-[#8a9485] hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"><MessageSquare size={13} /></button>
                      <button onClick={() => handleEdit(teacher)} className="p-1.5 text-[#8a9485] hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(teacher.id)} className="p-1.5 text-[#8a9485] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPOUT DETAILED VIEW */}
      {isViewOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-md rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedTeacher.status === 'Active' ? 'bg-[#4a5d4e]' : 'bg-rose-600'}`} />
            <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={15} /></button>
            <div className="flex items-center gap-3.5 mb-4 mt-2">
              <div className="p-2.5 bg-[#f4f0e6] border border-[#e2dcd0] rounded-xl text-[#4a5d4e]"><Users size={18} /></div>
              <div>
                <h3 className="text-sm font-black text-[#1a202c] tracking-tight">{selectedTeacher.name}</h3>
                <p className="text-[10px] text-[#8a9485] font-mono uppercase tracking-wider">{selectedTeacher.id} | {selectedTeacher.role}</p>
              </div>
            </div>
            
            <div className="bg-[#f4f0e6]/50 border border-[#e2dcd0]/60 rounded-xl p-4 space-y-2.5 font-mono text-xs text-[#5a6455] mb-4">
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Experience:</span><span className="text-[#1a202c] font-bold">{selectedTeacher.experience}</span></div>
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Payroll Status:</span><span className="text-[#4a5d4e] font-bold">{selectedTeacher.payrollStatus}</span></div>
              <div className="flex justify-between items-center"><span>Contact Cell:</span><span className="text-[#1a202c]">{selectedTeacher.phone}</span></div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] text-[#8a9485] uppercase font-bold flex items-center gap-1 mb-2"><BookOpen size={12} /> Assigned Slots:</div>
              <div className="bg-[#f4f0e6]/40 border border-[#e2dcd0] rounded-xl p-3 max-h-24 overflow-y-auto space-y-1 text-[11px] font-mono text-[#7a8475]">
                {selectedTeacher.batches.length > 0 ? selectedTeacher.batches.map((batch, i) => <div key={i}>• {batch}</div>) : "No active batches mapped."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => window.open(`https://wa.me/91${selectedTeacher.phone}`, "_blank")} className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all"><MessageSquare size={13} /> WhatsApp</button>
              <button onClick={() => handleEdit(selectedTeacher)} className="px-3 py-2 bg-[#f4f0e6] border border-[#e2dcd0] text-[#5a6455] rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#e2dcd0]/50 transition-all"><Pencil size={13} /> Edit Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#fcfbfa] border border-[#e2dcd0] w-full max-w-md rounded-2xl p-6 shadow-xl relative text-[#2c3539]">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-[#8a9485] hover:text-[#1a202c] transition-colors cursor-pointer"><X size={15} /></button>
            <h3 className="text-xs font-black text-[#1a202c] mb-5 uppercase tracking-wider border-b border-[#e2dcd0] pb-2">{editingTeacher ? `Modify Record: ${editingTeacher.id}` : "Onboard New Instructor"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#5a6455] mb-1.5 font-bold">Instructor Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none focus:border-[#4a5d4e]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Faculty Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-2 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none">
                    <option value="Senior Trainer">Senior Trainer</option>
                    <option value="Assistant Coach">Assistant Coach</option>
                    <option value="Vedic Math Expert">Vedic Math Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Total Experience</label>
                  <input type="text" placeholder="e.g. 3 Years" required value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none focus:border-[#4a5d4e]" />
                </div>
              </div>
              <div>
                <label className="block text-[#5a6455] mb-1.5 font-bold">Contact Cell Number</label>
                <input type="tel" required placeholder="10 digit cellphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] font-mono focus:outline-none focus:border-[#4a5d4e]" />
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