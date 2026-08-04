// src/app/dashboard/franchise/teachers/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, Users, ShieldAlert, CheckCircle2, 
  MessageSquare, BookOpen, Pencil, Trash, X, Save, ArrowLeft, 
  Search, Download, Plus, Layers
} from "lucide-react";
import { api } from "@/services/api";

export default function FranchiseTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "Senior Trainer",
    status: "Active",
    experience: "",
    phone: "",
    payrollStatus: "Pending"
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.franchise.getTeachers();
      let data = res?.teachers || res?.data || res;
      if (data && data.data) data = data.data;

      if (Array.isArray(data)) {
        const formatted = data.map((t, idx) => ({
          id: `TCH-${String(t.id || idx + 1).padStart(3, '0')}`,
          rawId: t.id,
          name: t.name || 'Instructor',
          role: t.specialization || 'Senior Facilitator',
          batches: t.batches ? t.batches.map(b => b.name || b) : ['Morning Batch A'],
          status: 'Active',
          experience: t.experience ? `${t.experience} Years` : '2 Years',
          payrollStatus: 'Verified',
          email: t.user?.email || t.email || 'faculty@abacus.com',
          phone: t.phone || t.user?.phone || '+91 9876543210'
        }));
        setTeachers(formatted);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to load teachers roster.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (teachers.length === 0) return;
    const headers = ["ID", "Name", "Role", "Experience", "Phone", "Status"];
    const rows = teachers.map(t => [t.id, t.name, t.role, t.experience, t.phone, t.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Franchise_Faculty_Roster_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? { 
        ...t, 
        name: formData.name, 
        role: formData.role, 
        status: formData.status,
        experience: `${formData.experience} Years`,
        phone: formData.phone,
        payrollStatus: formData.payrollStatus
      } : t));
    } else {
      const newInst = {
        id: `TCH-${String(teachers.length + 1).padStart(3, '0')}`,
        name: formData.name,
        role: formData.role,
        batches: ["Unassigned"],
        status: formData.status,
        experience: `${formData.experience || 1} Years`,
        payrollStatus: formData.payrollStatus || 'Pending',
        email: `${formData.name.toLowerCase().replace(/\s+/g, '')}@abacus.com`,
        phone: formData.phone || "+91 9000000000"
      };
      setTeachers([newInst, ...teachers]);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      role: teacher.role,
      status: teacher.status,
      experience: teacher.experience.replace(/[^0-9]/g, ""),
      phone: teacher.phone,
      payrollStatus: teacher.payrollStatus
    });
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
    setEditingTeacher(null);
  };

  return (
    <div className="space-y-6 w-full text-[#2c3539]">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">FACULTY ROSTERS</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Manage franchise instructors, core profiles, and assigned teaching logs.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={exportToCSV} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5">
            <Download size={13} /><span>Export Faculty</span>
          </button>
          <button onClick={() => { setEditingTeacher(null); resetForm(); setIsFormOpen(true); }} className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine">
            <UserPlus size={14} /><span>Onboard Instructor</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9485]" />
          <input 
            type="text" 
            placeholder="Search by instructor, ID, or specialization..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl text-xs text-[#1a202c] focus:outline-none focus:border-[#4a5d4e]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["All", "Active", "Inactive"].map(st => (
            <button 
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedStatus === st 
                  ? "bg-[#4a5d4e] text-white shadow-sm" 
                  : "bg-[#f4f0e6] text-[#5a6455] hover:bg-[#e2dcd0]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* FACULTY ROSTER TABLE */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-[#8a9485]">Fetching faculty records...</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#8a9485]">No instructors matching criteria.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f0e6] text-[#5a6455] font-mono text-[10px] uppercase border-b border-[#e2dcd0]">
                <tr>
                  <th className="py-3 px-4">Instructor ID</th>
                  <th className="py-3 px-4">Faculty Name</th>
                  <th className="py-3 px-4">Specialization / Role</th>
                  <th className="py-3 px-4">Exp.</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dcd0]/60 text-[#2c3539]">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-[#f4f0e6]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#4a5d4e]">{teacher.id}</td>
                    <td className="py-3 px-4 font-bold text-[#1a202c]">{teacher.name}</td>
                    <td className="py-3 px-4 text-[#5a6455]">{teacher.role}</td>
                    <td className="py-3 px-4 font-mono">{teacher.experience}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        teacher.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setSelectedTeacher(teacher); setIsViewOpen(true); }} className="p-1.5 text-[#5a6455] hover:text-[#4a5d4e] hover:bg-[#f4f0e6] rounded-lg transition-colors cursor-pointer" title="View Details">
                          <BookOpen size={14} />
                        </button>
                        <button onClick={() => handleEdit(teacher)} className="p-1.5 text-[#5a6455] hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="Edit Profile">
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Email:</span><span className="text-[#1a202c] font-bold">{selectedTeacher.email}</span></div>
              <div className="flex justify-between items-center border-b border-[#e2dcd0]/60 pb-2"><span>Payroll Status:</span><span className="text-[#4a5d4e] font-bold">{selectedTeacher.payrollStatus}</span></div>
              <div className="flex justify-between items-center"><span>Contact Cell:</span><span className="text-[#1a202c]">{selectedTeacher.phone}</span></div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] text-[#8a9485] uppercase font-bold flex items-center gap-1 mb-2"><BookOpen size={12} /> Assigned Slots:</div>
              <div className="bg-[#f4f0e6]/40 border border-[#e2dcd0] rounded-xl p-3 max-h-24 overflow-y-auto space-y-1 text-[11px] font-mono text-[#7a8475]">
                {selectedTeacher.batches?.length > 0 ? selectedTeacher.batches.map((batch, i) => <div key={i}>• {batch}</div>) : "No active batches mapped."}
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
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Experience (Years)</label>
                  <input type="number" min="0" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#5a6455] mb-1.5 font-bold">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-2 py-2 rounded-xl bg-[#fcfbfa] border border-[#e2dcd0] text-[#1a202c] focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-[#e2dcd0]">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-[#f4f0e6] text-[#5a6455] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#e2dcd0]/50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-95 shadow-md shadow-[#FF6B2B]/20 btn-shine">{editingTeacher ? "Save Changes" : "Onboard Instructor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
