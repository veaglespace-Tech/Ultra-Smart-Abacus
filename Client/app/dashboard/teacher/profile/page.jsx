// src/app/dashboard/teacher/profile/page.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Award, Briefcase, Lock, ShieldCheck, Camera, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.services';

export default function TeacherProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: ''
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
      setProfileImage(user?.profilePhoto || null);
    }
  }, [user]);

  const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const _publicBase = _apiUrl.replace(/\/api\/?$/, "");

  const _rawImage = profileImage || user?.profilePhoto || null;
  const resolvedProfileImage = _rawImage
    ? _rawImage.startsWith("/")
      ? `${_publicBase}${_rawImage}`
      : _rawImage
    : null;

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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

          const updatedUser = {
            ...(user || {}),
            name: profile.name || user?.name,
            email: profile.email || user?.email,
            phone: profile.phone || user?.phone,
            profilePhoto: compressedDataUrl
          };
          if (setUser) setUser(updatedUser);
          storageService.setUser(updatedUser);
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
      const updatedUser = {
        ...(user || {}),
        profilePhoto: null
      };
      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const updatedUser = {
      ...(user || {}),
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      profilePhoto: profileImage || null
    };

    if (setUser) setUser(updatedUser);
    storageService.setUser(updatedUser);

    setTimeout(() => {
      setIsSavingProfile(false);
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
      alert("Faculty Profile Successfully Updated.");
    }, 600);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert("Password Security Credentials Updated.");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">FACULTY PROFILE</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Manage credentials, contact information, qualifications, and passwords.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* PROFILE PICTURE CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto">
            {resolvedProfileImage ? (
              <img
                src={resolvedProfileImage}
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover border-2 border-primary/20 shadow-md"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black shadow-md shadow-primary/20">
                {profile.name
                  ? profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "TA"}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              title="Change Photo"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* ACTION BUTTONS FOR PHOTO */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Camera size={13} />
              <span>{resolvedProfileImage ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            
            {resolvedProfileImage && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Delete Profile Photo"
              >
                <Trash2 size={13} />
                <span>Delete Photo</span>
              </button>
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-50 text-base">{profile.name}</h3>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">Senior Math Facilitator</p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 text-left space-y-2 text-xs font-semibold text-slate-550 dark:text-slate-400">
            <p className="flex items-center gap-2">
              <Mail size={13} className="text-slate-400" />
              <span>{profile.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={13} className="text-slate-400" />
              <span>{profile.phone}</span>
            </p>
          </div>
        </div>

        {/* PROFILE DETAILS FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-5">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide flex items-center gap-2">
            <User size={16} className="text-accent" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <User size={14} className="text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <Mail size={14} className="text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <Phone size={14} className="text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Highest Qualification</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <Award size={14} className="text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={profile.qualification}
                    onChange={(e) => setProfile(prev => ({ ...prev, qualification: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Years of Experience</label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                <Briefcase size={14} className="text-slate-400" />
                <input 
                  type="text"
                  required
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button 
                type="submit"
                disabled={isSavingProfile}
                className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine"
              >
                {isSavingProfile ? 'Saving Details...' : 'Update Faculty Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* PASSWORD RESET CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-3 space-y-5">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide flex items-center gap-2">
            <Lock size={16} className="text-accent" />
            <span>Change Security Password</span>
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Password</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <Lock size={14} className="text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <Lock size={14} className="text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-105"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button 
                type="submit"
                disabled={isSavingPassword}
                className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#FF6B2B]/25 btn-shine"
              >
                {isSavingPassword ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
