"use client";

import React, { useState } from "react";
import { useStudentData } from "../StudentContext";

export default function StudentProfilePage() {
  const { profile, updateProfile } = useStudentData();

  // Edit Profile form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editParentName, setEditParentName] = useState(profile.parentName);
  const [profileSuccess, setProfileSuccess] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      parentName: editParentName
    });
    setIsEditingProfile(false);
    setProfileSuccess("Profile updated successfully!");
    setTimeout(() => setProfileSuccess(""), 3000);
  };

  // Get initials for profile badge
  const initials = profile.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "ST";

  return (
    <div className="space-y-6">
      {/* Profile modification success message */}
      {profileSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 shadow-inner flex items-center gap-2 animate-fade-in">
          <span className="text-lg">✔</span>
          <span>{profileSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
        
        {/* Visual profile detail summary card */}
        <div className="lg:col-span-4 rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col items-center text-center shadow-lg">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 mb-4">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-2xl text-blue-300">
              {initials}
            </div>
          </div>
          
          <h3 className="text-base font-bold text-white">{profile.name}</h3>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{profile.rollNo}</span>
          
          <div className="w-full border-t border-white/5 mt-6 pt-6 space-y-3.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Course Level</span>
              <span className="text-slate-200 font-bold">Level {profile.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Assigned Batch</span>
              <span className="text-slate-200 font-bold">{profile.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Registered Center</span>
              <span className="text-slate-200 font-bold text-right truncate max-w-[170px]">{profile.center}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Admission Date</span>
              <span className="text-slate-200 font-bold font-mono">{profile.admissionDate}</span>
            </div>
          </div>
        </div>

        {/* Profile detail values sheet / edit form */}
        <div className="lg:col-span-8 rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {isEditingProfile ? "Modify Profile Information" : "Personal Records Profile Information"}
            </h3>
            {!isEditingProfile && (
              <button
                onClick={() => {
                  setEditName(profile.name);
                  setEditEmail(profile.email);
                  setEditPhone(profile.phone);
                  setEditParentName(profile.parentName);
                  setIsEditingProfile(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-bold transition-all active:scale-95 cursor-pointer"
              >
                Modify Profile
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Parent Name / Representative
                  </label>
                  <input
                    type="text"
                    required
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 active:scale-95 transition-all"
                >
                  Cancel Change
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10 hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition-all cursor-pointer"
                >
                  Apply Change
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs mt-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Full Name</span>
                <p className="text-slate-200 mt-1 font-bold">{profile.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Registered Email</span>
                <p className="text-slate-200 mt-1 font-bold font-mono">{profile.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Parent/Guardian Name</span>
                <p className="text-slate-200 mt-1 font-bold">{profile.parentName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Contact Number</span>
                <p className="text-slate-200 mt-1 font-bold font-mono">{profile.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Assigned Center Location</span>
                <p className="text-slate-200 mt-1 font-bold">{profile.center}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Admission Date</span>
                <p className="text-slate-200 mt-1 font-bold font-mono">{profile.admissionDate}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
