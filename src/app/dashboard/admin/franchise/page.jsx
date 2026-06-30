"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminData } from "../AdminContext";

function FranchiseListContent() {
  const {
    franchises,
    setFranchises,
    handleAddFranchise
  } = useAdminData();

  const searchParams = useSearchParams();
  const shouldAdd = searchParams.get("add");

  // New Franchise Form States
  const [franchiseName, setFranchiseName] = useState("");
  const [franchiseOwner, setFranchiseOwner] = useState("");
  const [franchiseLocation, setFranchiseLocation] = useState("");
  const [showAddFranchiseModal, setShowAddFranchiseModal] = useState(false);

  // Trigger add modal if query param is set
  useEffect(() => {
    if (shouldAdd === "true") {
      setShowAddFranchiseModal(true);
    }
  }, [shouldAdd]);

  // Add Franchise Handler
  const submitAddFranchise = (e) => {
    e.preventDefault();
    if (!franchiseName || !franchiseOwner) return;

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
      email: `${franchiseOwner.toLowerCase().replace(/\s+/g, "")}@abacus.com`,
      role: "Franchise",
      status: "Active",
      date: new Date().toISOString().split("T")[0],
      location: franchiseName
    };

    handleAddFranchise(newFranchise, newFranchiseUser);

    setFranchiseName("");
    setFranchiseOwner("");
    setFranchiseLocation("");
    setShowAddFranchiseModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white">Registered Academy Franchises</h3>
          <p className="text-[10px] text-slate-400 font-light mt-0.5">Manage regional training branch details and approvals.</p>
        </div>
        <button
          onClick={() => setShowAddFranchiseModal(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Register Franchise Center
        </button>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {franchises.map((franchise) => (
          <div key={franchise.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 shadow-lg backdrop-blur-md hover:bg-white/[0.03] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
                  F{franchise.id}
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  franchise.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {franchise.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-4">{franchise.name}</h4>
              <p className="text-xs text-slate-400 mt-1 font-light flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {franchise.location}
              </p>

              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Owner</span>
                  <p className="text-slate-200 mt-0.5 font-bold truncate">{franchise.owner}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Students</span>
                  <p className="text-slate-200 mt-0.5 font-bold font-mono">{franchise.students} active</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex gap-2">
              <button
                onClick={() => {
                  const amt = parseInt(prompt(`Add students to ${franchise.name}:`, "10"));
                  if (amt && !isNaN(amt)) {
                    setFranchises(franchises.map(f => f.id === franchise.id ? { ...f, students: f.students + amt } : f));
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-semibold transition-all active:scale-95"
              >
                Add Students
              </button>
              <button
                onClick={() => {
                  setFranchises(franchises.map(f => f.id === franchise.id ? {
                    ...f,
                    status: f.status === "Active" ? "Suspended" : "Active"
                  } : f));
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-semibold transition-all active:scale-95"
              >
                Toggle Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FRANCHISE CREATION MODAL */}
      {showAddFranchiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-6">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-bold text-white">Add New Academy Center</h3>
              <button
                onClick={() => setShowAddFranchiseModal(false)}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
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
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
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
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFranchiseModal(false)}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10 hover:from-blue-600 hover:to-indigo-700 transition-all cursor-pointer"
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
