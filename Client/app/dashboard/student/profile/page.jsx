"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Trash2, User, Mail, Phone, UserCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { useStudentData } from "../StudentContext";
import { storageService } from "@/services/storage.services";
import { useAuth } from "@/context/AuthContext";

export default function StudentProfilePage() {
  const { profile, updateProfile } = useStudentData();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(profile.profilePhoto || user?.profilePhoto || null);

  // Edit Profile form states
  const [editName, setEditName] = useState(profile.name || "");
  const [editEmail, setEditEmail] = useState(profile.email || "");
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [editParentName, setEditParentName] = useState(profile.parentName || "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfileImage(profile.profilePhoto || user?.profilePhoto || null);
    setEditName(profile.name || user?.name || "");
    setEditEmail(profile.email || user?.email || "");
    setEditPhone(profile.phone || user?.phone || "");
    setEditParentName(profile.parentName || user?.parentGuardianName || user?.fatherName || "");
  }, [profile, user]);

  const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const _publicBase = _apiUrl.replace(/\/api\/?$/, "");

  const _rawPhoto = profileImage || profile.profilePhoto || user?.profilePhoto || null;
  const resolvedProfilePhoto = _rawPhoto
    ? _rawPhoto.startsWith("/")
      ? `${_publicBase}${_rawPhoto}`
      : _rawPhoto
    : null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 400;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > MAX) { h *= MAX / w; w = MAX; }
          } else {
            if (h > MAX) { w *= MAX / h; h = MAX; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

          setProfileImage(compressedDataUrl);
          updateProfile({ profilePhoto: compressedDataUrl });

          const updatedUser = {
            ...(user || {}),
            profilePhoto: compressedDataUrl
          };
          if (setUser) setUser(updatedUser);
          storageService.setUser(updatedUser);
          setProfileSuccess("Profile photo updated successfully!");
          setTimeout(() => setProfileSuccess(""), 3000);
        };
      };
    }
  };

  const handleDeletePhoto = () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      updateProfile({ profilePhoto: null });

      const updatedUser = {
        ...(user || {}),
        profilePhoto: null
      };
      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
      setProfileSuccess("Profile photo removed successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = storageService.getToken();
      const formPayload = new FormData();
      formPayload.append("name", editName);
      formPayload.append("email", editEmail);
      formPayload.append("phone", editPhone);
      formPayload.append("fatherName", editParentName);
      if (profileImage && profileImage.startsWith("data:")) {
        formPayload.append("profilePhoto", profileImage);
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/${profile.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
        profilePhoto: profileImage,
      });

      const updatedUser = {
        ...(user || {}),
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentGuardianName: editParentName,
        fatherName: editParentName,
        profilePhoto: profileImage
      };
      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
    } catch (err) {
      console.error(err);
      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
        profilePhoto: profileImage,
      });
      const updatedUser = {
        ...(user || {}),
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentGuardianName: editParentName,
        fatherName: editParentName,
        profilePhoto: profileImage
      };
      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
    } finally {
      setIsSaving(false);
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
      setProfileSuccess("Student Profile Successfully Updated!");
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  // Get initials for profile badge
  const initials = (editName || profile.name)
    ? (editName || profile.name).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">STUDENT PROFILE HUB</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Manage your personal profile details, contact information, and upload avatar.</p>
        </div>
      </div>

      {/* Profile modification success message */}
      {profileSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-350 shadow-inner flex items-center gap-2 animate-fade-in">
          <span className="text-lg">✔</span>
          <span>{profileSuccess}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
        
        {/* Visual profile detail summary card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col items-center text-center shadow-sm">
          <div className="relative w-24 h-24 mb-2">
            {resolvedProfilePhoto ? (
              <img
                src={resolvedProfilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF6B2B] to-[#FFCA28] p-1">
                <div className="w-full h-full rounded-full bg-slate-955 flex items-center justify-center font-black text-2xl text-orange-400">
                  {initials}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-[#FF6B2B] hover:bg-orange-600 text-white p-2 rounded-full shadow-lg cursor-pointer transition-colors"
              title="Change Photo"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Action buttons for photo */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Camera size={12} />
              <span>{resolvedProfilePhoto ? 'Change' : 'Upload'}</span>
            </button>
            
            {resolvedProfilePhoto && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Delete Photo"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}
          </div>
          
          <h3 className="text-base font-bold text-slate-950 dark:text-white">{editName || profile.name}</h3>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{profile.rollNo}</span>
          
          <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 space-y-3.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Course Level</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">Level {profile.level || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Assigned Batch</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{profile.batch || "Afternoon Batch"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Registered Center</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold text-right truncate max-w-[170px]">{profile.center || "Main Academy Center"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Admission Date</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">{profile.admissionDate || "7/29/2026"}</span>
            </div>
          </div>
        </div>

        {/* Profile detail values sheet / form */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
            <h3 className="text-xs font-black tracking-tight uppercase flex items-center gap-2">
              <User size={16} className="text-accent" />
              <span className="gradient-text">PERSONAL RECORDS PROFILE INFORMATION</span>
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
                  <User size={14} className="text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Registered Email
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
                  <Mail size={14} className="text-slate-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Contact Number
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
                  <Phone size={14} className="text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Parent / Guardian Name
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
                  <UserCheck size={14} className="text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine border-none"
              >
                {isSaving ? 'Updating...' : 'Update Student Profile'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
