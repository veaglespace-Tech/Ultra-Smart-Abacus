"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminData } from "../AdminContext";
import { Building2, GraduationCap, Users, CreditCard, BookOpen, X, Eye } from "lucide-react";

function FranchiseListContent() {
  const {
    franchises,
    setFranchises,
    handleAddFranchise,
    loading
  } = useAdminData();

  const searchParams = useSearchParams();
  const shouldAdd = searchParams.get("add");

  // New Franchise Form States
  const [franchiseName, setFranchiseName] = useState("");
  const [franchiseOwner, setFranchiseOwner] = useState("");
  const [franchiseEmail, setFranchiseEmail] = useState("");
  const [franchisePhone, setFranchisePhone] = useState("");
  const [franchisePassword, setFranchisePassword] = useState("");
  const [franchiseLocation, setFranchiseLocation] = useState("");
  const [showAddFranchiseModal, setShowAddFranchiseModal] = useState(false);
  
  // Franchise Detail Modal States
  const [selectedFranchiseDetail, setSelectedFranchiseDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [error, setError] = useState(null);

  // Trigger add modal if query param is set
  useEffect(() => {
    if (shouldAdd === "true") {
      setShowAddFranchiseModal(true);
    }
  }, [shouldAdd]);

  // Add Franchise Handler
  const submitAddFranchise = async (e) => {
    e.preventDefault();
    if (!franchiseName || !franchiseOwner || !franchiseEmail || !franchisePassword) return;
    setError(null);

    const newFranchise = {
      id: Date.now(),
      name: franchiseName,
      owner: franchiseOwner,
      location: franchiseLocation || "Unspecified",
      students: 0,
      status: "Active"
    };

    const newFranchiseUser = {
      id: Date.now() + 1,
      name: franchiseOwner,
      email: franchiseEmail,
      phone: franchisePhone || "9876543210",
      password: franchisePassword,
      role: "Franchise",
      status: "Active",
      date: new Date().toISOString().split("T")[0],
      location: franchiseName
    };

    try {
      await handleAddFranchise(newFranchise, newFranchiseUser);
      setFranchiseName("");
      setFranchiseOwner("");
      setFranchiseEmail("");
      setFranchisePhone("");
      setFranchisePassword("");
      setFranchiseLocation("");
      setShowAddFranchiseModal(false);
    } catch (err) {
      setError(err.message || "Failed to add franchise");
    }
  };

  const currentDetail = selectedFranchiseDetail
    ? franchises.find(f => Number(f.id) === Number(selectedFranchiseDetail.id)) || selectedFranchiseDetail
    : null;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">REGISTERED ACADEMY FRANCHISES</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Manage regional training branch details, approvals, and view center analytics.</p>
        </div>
        <button
          onClick={() => setShowAddFranchiseModal(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-xs font-bold text-white shadow-md shadow-[#FF6B2B]/20 hover:opacity-90 transition-all cursor-pointer"
        >
          Register Franchise Center
        </button>
      </div>

      {/* Grid cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium font-mono text-xs">
          Loading regional franchise centers...
        </div>
      ) : franchises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {franchises.map((franchise) => (
            <div 
              key={franchise.id} 
              onClick={() => { setSelectedFranchiseDetail(franchise); setActiveTab("overview"); }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-550 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center font-bold text-sm">
                    F{franchise.id}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    franchise.status === "Active"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                      : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                  }`}>
                    {franchise.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-4 group-hover:text-indigo-600 transition-colors">{franchise.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {franchise.location}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Owner</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-bold truncate">{franchise.owner}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Students</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-bold font-mono">{franchise.students} active</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-150 dark:border-slate-800 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFranchiseDetail(franchise);
                    setActiveTab("overview");
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye size={13} /> View Center Overview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFranchises(franchises.map(f => f.id === franchise.id ? {
                      ...f,
                      status: f.status === "Active" ? "Suspended" : "Active"
                    } : f));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  Toggle Status
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
          <Building2 size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No regional franchise centers found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click "Register Franchise Center" above to add a new branch.</p>
        </div>
      )}

      {/* FRANCHISE DETAILED OVERVIEW MODAL */}
      {currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col animate-scale-in">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">F{currentDetail.id}</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{currentDetail.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {currentDetail.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                  <span>Owner: <strong>{currentDetail.owner}</strong></span>
                  {currentDetail.email && <span>Email: {currentDetail.email}</span>}
                  <span>Location: {currentDetail.location}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedFranchiseDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-1 mb-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Building2 size={14} /> Overview
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "students"
                    ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <GraduationCap size={14} /> Students ({currentDetail.students})
              </button>
              <button
                onClick={() => setActiveTab("teachers")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "teachers"
                    ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Users size={14} /> Teachers ({currentDetail.teachersCount || 0})
              </button>
              <button
                onClick={() => setActiveTab("fees")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "fees"
                    ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CreditCard size={14} /> Student Fees
              </button>
              <button
                onClick={() => setActiveTab("batches")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "batches"
                    ? "bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen size={14} /> Batches ({currentDetail.batchesCount || 0})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs">
              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{currentDetail.students}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-500">Teachers</span>
                      <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{currentDetail.teachersCount || 0}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5">
                      <span className="text-[10px] uppercase font-bold text-amber-500">Batches</span>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{currentDetail.batchesCount || 0}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Fee Records</span>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{currentDetail.rawFees?.length || 0}</p>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">Center Overview Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      <div><span className="text-slate-400">Franchise ID:</span> <span className="font-bold">F{currentDetail.id}</span></div>
                      <div><span className="text-slate-400">Center Name:</span> <span className="font-bold">{currentDetail.name}</span></div>
                      <div><span className="text-slate-400">Franchise Owner:</span> <span>{currentDetail.owner}</span></div>
                      <div><span className="text-slate-400">Contact Email:</span> <span>{currentDetail.email || "N/A"}</span></div>
                      <div><span className="text-slate-400">Location:</span> <span>{currentDetail.location}</span></div>
                      <div><span className="text-slate-400">Status:</span> <span className="text-emerald-600 font-bold">{currentDetail.status}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Students */}
              {activeTab === "students" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white">Registered Center Students ({currentDetail.rawStudents?.length || 0})</h4>
                  {currentDetail.rawStudents && currentDetail.rawStudents.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">Student Name</th>
                            <th className="py-2.5 px-3">Parent Contact</th>
                            <th className="py-2.5 px-3">Batch Slot</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {currentDetail.rawStudents.map((s, idx) => (
                            <tr key={s.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">STU-{s.id}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                              <td className="py-2.5 px-3 font-mono">{s.phone || "N/A"}</td>
                              <td className="py-2.5 px-3">{s.batch?.name || s.batchName || "Unassigned"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                      No students enrolled under this franchise center yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Teachers */}
              {activeTab === "teachers" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white">Assigned Instructors ({currentDetail.rawTeachers?.length || 0})</h4>
                  {currentDetail.rawTeachers && currentDetail.rawTeachers.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">Teacher Name</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3">Specialization</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {currentDetail.rawTeachers.map((t, idx) => (
                            <tr key={t.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">TCH-{t.id}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{t.name}</td>
                              <td className="py-2.5 px-3 font-mono">{t.phone || "N/A"}</td>
                              <td className="py-2.5 px-3">{t.specialization || "Abacus Trainer"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                      No instructors assigned to this franchise center yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Student Fees */}
              {activeTab === "fees" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white">Center Fee Collection Records ({currentDetail.rawFees?.length || 0})</h4>
                  {currentDetail.rawFees && currentDetail.rawFees.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                            <th className="py-2.5 px-3">Record ID</th>
                            <th className="py-2.5 px-3">Student ID</th>
                            <th className="py-2.5 px-3">Total Amount</th>
                            <th className="py-2.5 px-3">Paid Amount</th>
                            <th className="py-2.5 px-3">Due Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {currentDetail.rawFees.map((fee, idx) => (
                            <tr key={fee.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">FEE-{fee.id}</td>
                              <td className="py-2.5 px-3 font-mono">STU-{fee.studentId}</td>
                              <td className="py-2.5 px-3 font-mono font-bold">₹{fee.amount}</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-600">₹{fee.paidAmount || 0}</td>
                              <td className="py-2.5 px-3 font-mono text-amber-600">₹{fee.dueAmount || 0}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  fee.status === 'PAID' || fee.dueAmount === 0
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {fee.status || (fee.dueAmount === 0 ? 'PAID' : 'PENDING')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                      No fee records logged for this center yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Batches */}
              {activeTab === "batches" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white">Active Course Batches ({currentDetail.rawBatches?.length || 0})</h4>
                  {currentDetail.rawBatches && currentDetail.rawBatches.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentDetail.rawBatches.map((b, idx) => (
                        <div key={b.id || idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl space-y-1">
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">{b.code || `BATCH-${b.id}`}</span>
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs">{b.name}</h5>
                          <p className="text-[11px] text-slate-500">Level: {b.level || "General Abacus"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                      No active batches configured for this franchise center yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedFranchiseDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Overview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FRANCHISE CREATION MODAL */}
      {showAddFranchiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-6">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-bold text-white">Add New Academy Center</h3>
              <button
                onClick={() => {
                  setShowAddFranchiseModal(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[11px] text-red-300 shadow-inner mb-4">
                {error}
              </div>
            )}

            <form onSubmit={submitAddFranchise} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Franchise/Center Name *
                </label>
                <input
                  type="text"
                  required
                  value={franchiseName}
                  onChange={(e) => setFranchiseName(e.target.value)}
                  placeholder="e.g. Pune Central Training Center"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-black placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Owner / Representative Name *
                </label>
                <input
                  type="text"
                  required
                  value={franchiseOwner}
                  onChange={(e) => setFranchiseOwner(e.target.value)}
                  placeholder="e.g. Suresh Deshmukh"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-black placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={franchiseEmail}
                    onChange={(e) => setFranchiseEmail(e.target.value)}
                    placeholder="e.g. suresh@abacus.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-black placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={franchisePhone}
                    onChange={(e) => setFranchisePhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-black placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Password *
                </label>
                <input
                  type="password"
                  required
                  value={franchisePassword}
                  onChange={(e) => setFranchisePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-black placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  value={franchiseLocation}
                  onChange={(e) => setFranchiseLocation(e.target.value)}
                  placeholder="e.g. Deccan Gymkhana, Pune"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-black placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFranchiseModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-md shadow-[#FF6B2B]/20 hover:opacity-90 transition-all cursor-pointer"
                >
                  Add Franchise
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function FranchiseListPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-xs">Loading Franchise List...</div>}>
      <FranchiseListContent />
    </Suspense>
  );
}
