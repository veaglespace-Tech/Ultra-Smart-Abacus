"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import { useStudentData } from "../StudentContext";
import { storageService } from "@/services/storage.services";

export default function StudentProfilePage() {
  const { profile, updateProfile } = useStudentData();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(profile.profilePhoto || null);

  useEffect(() => {
    setProfileImage(profile.profilePhoto || null);
  }, [profile.profilePhoto]);

  const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const _publicBase = _apiUrl.replace(/\/api\/?$/, "");

  const resolvedProfilePhoto = profileImage
    ? profileImage.startsWith("/")
      ? `${_publicBase}${profileImage}`
      : profileImage
    : null;

  // Edit Profile form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editParentName, setEditParentName] = useState(profile.parentName);
  const [profileSuccess, setProfileSuccess] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = storageService.getToken();
      const formPayload = new FormData();
      formPayload.append("name", editName);
      formPayload.append("email", editEmail);
      formPayload.append("phone", editPhone);
      formPayload.append("fatherName", editParentName);
      if (profileImage && profileImage.startsWith("blob:")) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const file = new File([blob], "profile-photo.jpg", { type: blob.type || "image/jpeg" });
        formPayload.append("profilePhoto", file);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/students/${profile.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Profile update failed");
      }
      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
        profilePhoto: data.data?.profilePhoto || profileImage,
      });
      setProfileImage(data.data?.profilePhoto || profileImage);
    } catch (err) {
      console.error(err);
      setProfileSuccess("Unable to update profile photo right now.");
      return;
    }
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
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col items-center text-center shadow-sm">
          <div className="relative w-24 h-24 mb-4">

  {resolvedProfilePhoto ? (
    <img
      src={resolvedProfilePhoto}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
    />
  ) : (
    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-1">
      <div className="w-full h-full rounded-full bg-slate-955 flex items-center justify-center font-black text-2xl text-blue-300">
        {initials}
      </div>
    </div>
  )}

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];

      if (file) {
        setProfileImage(URL.createObjectURL(file));
      }
    }}
  />

  <button
    type="button"
    onClick={() => fileInputRef.current.click()}
    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer"
  >
    <Camera size={14} />
  </button>

</div>
          
          <h3 className="text-base font-bold text-slate-950 dark:text-white">{profile.name}</h3>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{profile.rollNo}</span>
          
          <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 space-y-3.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Course Level</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">Level {profile.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Assigned Batch</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{profile.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Registered Center</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold text-right truncate max-w-[170px]">{profile.center}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Admission Date</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">{profile.admissionDate}</span>
            </div>
          </div>
        </div>

        {/* Profile detail values sheet / edit form */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 mb-5">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-wide uppercase">
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
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 text-xs text-slate-700 dark:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer"
              >
                Modify Profile
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/40 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                    Parent Name / Representative
                  </label>
                  <input
                    type="text"
                    required
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/40 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all"
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
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-bold">{profile.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Registered Email</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-bold font-mono">{profile.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Parent/Guardian Name</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-bold">{profile.parentName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Contact Number</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-bold font-mono">{profile.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Assigned Center Location</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-bold">{profile.center}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Admission Date</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 font-bold font-mono">{profile.admissionDate}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
