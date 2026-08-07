// src/app/dashboard/teacher/profile/page.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Award, Briefcase, Lock, ShieldCheck,
  Camera, Trash2, IdCard, CreditCard, Home, FileText,
  GraduationCap, Building2, ClipboardList, UploadCloud,
  Eye, Download, CheckCircle2, AlertCircle, X, FileCheck, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.services';

const TEACHER_DOCUMENT_TYPES = [
  { id: "passportPhoto", name: "Passport Size Photo", description: "Recent official passport size photo of faculty", icon: Camera, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", optional: false },
  { id: "aadhaarCard", name: "Aadhaar Card", description: "UIDAI Aadhaar card copy (Front & Back)", icon: IdCard, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", optional: false },
  { id: "panCard", name: "PAN Card", description: "Official Permanent Account Number card", icon: CreditCard, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800", optional: false },
  { id: "addressProof", name: "Address Proof", description: "Electricity Bill / Rent Agreement / Ration Card", icon: Home, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800", optional: false },
  { id: "resume", name: "Resume / CV", description: "Updated curriculum vitae / resume document", icon: FileText, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", optional: false },
  { id: "marksheets10th12th", name: "10th & 12th Marksheet", description: "SSC & HSC exam marksheet copies", icon: GraduationCap, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800", optional: false },
  { id: "graduationDegree", name: "Graduation Marksheet / Degree", description: "Bachelor's / Master's degree certificate or marksheets", icon: Award, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", optional: false },
  { id: "experienceCert", name: "Experience Certificate (optional)", description: "Previous work experience certificate (Optional)", icon: Briefcase, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800", optional: true },
  { id: "bankPassbook", name: "Bank Passbook", description: "Bank passbook front page or cancelled cheque for salary", icon: Building2, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800", optional: false },
  { id: "joiningForm", name: "Joining Form", description: "Signed teacher joining / appointment form", icon: ClipboardList, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", optional: false },
];

export default function TeacherProfilePage() {
  const { user, setUser, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  const docInputRefs = useRef({});

  const [profileImage, setProfileImage] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [validationError, setValidationError] = useState("");

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Faculty Document Vault State
  const [documents, setDocuments] = useState({
    passportPhoto: null,
    aadhaarCard: null,
    panCard: null,
    addressProof: null,
    resume: null,
    marksheets10th12th: null,
    graduationDegree: null,
    experienceCert: null,
    bankPassbook: null,
    joiningForm: null,
  });

  const [activeDocPreview, setActiveDocPreview] = useState(null);

  const mergeDocs = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    const res = { ...target };
    Object.keys(source).forEach(k => {
      if (source[k] !== undefined) {
        res[k] = source[k];
      }
    });
    return res;
  };

  // Helper to save documents reliably across local storage, session storage AND backend MySQL DB
  const saveDocumentsToStorage = async (updatedDocs) => {
    try {
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('abacus_teacher_documents', JSON.stringify(updatedDocs)); } catch (e) { }
        try { localStorage.setItem('abacus_teacher_documents', JSON.stringify(updatedDocs)); } catch (e) { }
      }

      const currentUser = user || (typeof window !== 'undefined' ? storageService.getUser() : null);
      const teacherObj = currentUser?.teacher || {};
      const updatedTeacher = { ...teacherObj, documents: updatedDocs };
      const updatedUser = {
        ...(currentUser || {}),
        documents: updatedDocs,
        teacher: updatedTeacher
      };
      if (setUser) setUser(updatedUser);
      if (storageService?.setUser) storageService.setUser(updatedUser);
      if (updateProfile) updateProfile({ documents: updatedDocs, teacher: updatedTeacher });

      // Direct Sync with Backend Server API DB
      const targetId = teacherObj.id || currentUser?.teacherId || currentUser?.rawId || currentUser?.id || "me";
      const token = storageService.getToken();
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teachers/${targetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ documents: updatedDocs }),
        }).then(res => res.json()).then(data => {
          console.log("Teacher documents API sync response:", data);
        }).catch(err => console.warn("API teacher documents sync warning:", err));
      }
    } catch (err) {
      console.warn("Storage save warning:", err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const currentUser = user || (typeof window !== 'undefined' ? storageService.getUser() : null);

    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        qualification: currentUser.qualification || currentUser.teacher?.qualification || prev.qualification || '',
        experience: currentUser.experience || currentUser.teacher?.experience || prev.experience || ''
      }));

      const storedPhoto = typeof window !== 'undefined'
        ? (storageService.get('abacus_teacher_profile_photo') || storageService.get('teacher_profile_photo'))
        : null;
      const photoToSet = storedPhoto || currentUser.profilePhoto || currentUser.teacher?.profilePhoto || null;
      if (photoToSet) {
        setProfileImage(photoToSet);
      }
    }

    // 1. Restore documents from local & session storage synchronously
    try {
      let mergedDocs = {};
      if (typeof window !== 'undefined') {
        const sessionItem = sessionStorage.getItem('abacus_teacher_documents');
        if (sessionItem) {
          try { mergedDocs = mergeDocs(mergedDocs, JSON.parse(sessionItem)); } catch (e) { }
        }
        const localItem = localStorage.getItem('abacus_teacher_documents');
        if (localItem) {
          try { mergedDocs = mergeDocs(mergedDocs, JSON.parse(localItem)); } catch (e) { }
        }
      }

      mergedDocs = mergeDocs(mergedDocs, currentUser?.documents);
      mergedDocs = mergeDocs(mergedDocs, currentUser?.teacher?.documents);

      if (Object.keys(mergedDocs).length > 0) {
        setDocuments(prev => mergeDocs(prev, mergedDocs));
      }
    } catch (e) {
      console.warn("Could not load local teacher documents:", e);
    }

    // 2. Fetch directly from Backend MySQL Database to guarantee permanent persistence
    const fetchBackendDocuments = async () => {
      try {
        const token = storageService.getToken();
        if (!token) return;
        const targetId = currentUser?.teacher?.id || currentUser?.teacherId || currentUser?.rawId || currentUser?.id;
        if (!targetId) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const teachersList = data?.teachers || data?.data || [];
        const currentTeacher = Array.isArray(teachersList)
          ? teachersList.find(t => String(t.id) === String(targetId) || String(t.userId) === String(currentUser?.id))
          : null;

        if (currentTeacher) {
          let dbDocs = currentTeacher.documents;
          if (typeof dbDocs === 'string') {
            try { dbDocs = JSON.parse(dbDocs); } catch (e) { }
          }
          if (dbDocs && typeof dbDocs === 'object') {
            setDocuments(prev => mergeDocs(prev, dbDocs));
            if (typeof window !== 'undefined') {
              try { sessionStorage.setItem('abacus_teacher_documents', JSON.stringify(dbDocs)); } catch (e) { }
              try { localStorage.setItem('abacus_teacher_documents', JSON.stringify(dbDocs)); } catch (e) { }
            }
          }

          if (currentTeacher.profilePhoto) {
            setProfileImage(currentTeacher.profilePhoto);
          }
        }
      } catch (err) {
        console.warn("Backend teacher document fetch warning:", err);
      }
    };

    fetchBackendDocuments();
  }, [user]);

  const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const _publicBase = _apiUrl.replace(/\/api\/?$/, "");

  const _rawImage = profileImage || (isMounted && typeof window !== 'undefined' ? (storageService.get('abacus_teacher_profile_photo') || storageService.get('teacher_profile_photo')) : null) || user?.profilePhoto || user?.teacher?.profilePhoto || null;
  const resolvedProfileImage = _rawImage
    ? _rawImage.startsWith("/")
      ? `${_publicBase}${_rawImage}`
      : _rawImage
    : null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX = 300;
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
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);

          setProfileImage(compressedDataUrl);
          setValidationError("");

          if (storageService?.set) {
            storageService.set('abacus_teacher_profile_photo', compressedDataUrl);
            storageService.set('teacher_profile_photo', compressedDataUrl);
          }

          const teacherObj = user?.teacher || {};
          const updatedTeacher = { ...teacherObj, profilePhoto: compressedDataUrl };
          const updatedUser = {
            ...(user || {}),
            name: profile.name || user?.name,
            email: profile.email || user?.email,
            phone: profile.phone || user?.phone,
            profilePhoto: compressedDataUrl,
            teacher: updatedTeacher
          };
          if (setUser) setUser(updatedUser);
          storageService.setUser(updatedUser);
          if (updateProfile) updateProfile({ profilePhoto: compressedDataUrl, teacher: updatedTeacher });

          // Direct Backend Sync to MySQL Teacher Table
          const targetId = teacherObj.id || user?.teacherId || user?.rawId || user?.id;
          if (targetId) {
            const token = storageService.getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teachers/${targetId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ profilePhoto: compressedDataUrl }),
            }).catch(err => console.warn("API profilePhoto sync warning:", err));
          }

          setProfileSuccess("Profile photo updated successfully!");
          setTimeout(() => setProfileSuccess(""), 3000);
        };
      };
    }
  };

  const handleDeletePhoto = async () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (storageService?.set) {
        storageService.set('abacus_teacher_profile_photo', null);
        storageService.set('teacher_profile_photo', null);
      }

      const teacherObj = user?.teacher || {};
      const updatedTeacher = { ...teacherObj, profilePhoto: null };
      const updatedUser = {
        ...(user || {}),
        profilePhoto: null,
        teacher: updatedTeacher
      };
      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
      if (updateProfile) updateProfile({ profilePhoto: null, teacher: updatedTeacher });

      // Direct Backend Sync
      const targetId = teacherObj.id || user?.teacherId || user?.rawId || user?.id;
      if (targetId) {
        const token = storageService.getToken();
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teachers/${targetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePhoto: null }),
        }).catch(err => console.warn("API profilePhoto remove warning:", err));
      }

      setProfileSuccess("Profile photo removed successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  const processAndSaveDocument = (docId, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB. Please select a smaller file.");
      return;
    }

    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + " KB";
    const uploadedAt = new Date().toLocaleDateString();

    const saveDoc = (dataUrl) => {
      const newDoc = {
        name: fileName,
        type: file.type,
        dataUrl: dataUrl,
        size: fileSize,
        uploadedAt: uploadedAt
      };

      setDocuments(prev => {
        const updated = { ...prev, [docId]: newDoc };
        setTimeout(() => saveDocumentsToStorage(updated), 0);
        return updated;
      });

      setValidationError("");
      setProfileSuccess(`${TEACHER_DOCUMENT_TYPES.find(d => d.id === docId)?.name || 'Document'} uploaded successfully!`);
      setTimeout(() => setProfileSuccess(""), 3000);
    };

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 900;
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
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.70);
          saveDoc(compressedDataUrl);
        };
        img.onerror = () => saveDoc(event.target.result);
      };
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        saveDoc(event.target.result);
      };
    }
  };

  const handleDocUpload = (docId, file) => {
    processAndSaveDocument(docId, file);
  };

  const handleDocDelete = (docId, docName) => {
    setDocuments(prev => {
      const updated = { ...prev, [docId]: null };
      setTimeout(() => saveDocumentsToStorage(updated), 0);
      return updated;
    });
    if (docInputRefs.current[docId]) {
      docInputRefs.current[docId].value = "";
    }
    setProfileSuccess(`${docName || 'Document'} deleted successfully.`);
    setTimeout(() => setProfileSuccess(""), 3000);
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setValidationError("");

    // Personal info required fields check
    const missingItems = [];
    if (!profile.name || !profile.name.trim()) missingItems.push("Full Name");

    if (missingItems.length > 0) {
      setValidationError(`Please complete required field: ${missingItems.join(", ")}`);
      return;
    }

    setIsSavingProfile(true);

    try {
      const currentUser = user || (typeof window !== 'undefined' ? storageService.getUser() : null);
      const teacherObj = currentUser?.teacher || {};
      const teacherId = teacherObj.id || currentUser?.teacherId || currentUser?.rawId || currentUser?.id || "me";

      const token = storageService.getToken();
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/teachers/${teacherId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            qualification: profile.qualification,
            experience: profile.experience,
            profilePhoto: profileImage,
            documents: documents
          }),
        }).catch((err) => console.warn("API update teacher warning:", err));
      }

      const updatedTeacher = {
        ...teacherObj,
        name: profile.name,
        qualification: profile.qualification,
        experience: profile.experience,
        phone: profile.phone,
        profilePhoto: profileImage || null,
        documents: documents
      };

      const updatedUser = {
        ...(user || {}),
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        qualification: profile.qualification,
        experience: profile.experience,
        profilePhoto: profileImage || null,
        documents: documents,
        teacher: updatedTeacher
      };

      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
      if (updateProfile) updateProfile(updatedUser);

      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
      setProfileSuccess("Faculty Profile & Verification Records Successfully Updated!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      alert("New password must be at least 4 characters long.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const token = storageService.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
      setProfileSuccess("Password updated successfully! Please use your new password next time you log in.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to update password. Please check your current password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const uploadedCount = Object.values(documents).filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">FACULTY PROFILE & VERIFICATION VAULT</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Manage personal credentials, contact information, qualifications, and official onboarding verification documents.</p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {profileSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-350 shadow-inner flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span className="font-semibold">{profileSuccess}</span>
        </div>
      )}

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
                <span>Remove</span>
              </button>
            )}
          </div>

          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-50 text-base">{profile.name || "Faculty Member"}</h3>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider mt-0.5">Abacus Certified Facilitator</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 text-left space-y-2.5 text-xs font-semibold text-slate-550 dark:text-slate-400">
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{profile.email || "No email provided"}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span>{profile.phone || "No phone provided"}</span>
            </p>
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Document Vault</span>
              <span suppressHydrationWarning className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200 dark:border-emerald-800">
                {isMounted ? uploadedCount : 0} / {TEACHER_DOCUMENT_TYPES.length} Uploaded
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE DETAILS FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-5">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide flex items-center gap-2">
            <User size={16} className="text-accent" />
            <span>Faculty Personal Information</span>
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
                    placeholder="e.g. B.Sc Mathematics / M.Ed"
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
                  placeholder="e.g. 3 Years"
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
                {isSavingProfile ? 'Saving Details...' : 'Update Teacher Details'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* TEACHER DOCUMENT VAULT & VERIFICATION RECORDS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide flex items-center gap-2">
              <FileCheck size={18} className="text-accent" />
              <span>Teacher Verification Document Vault</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload and manage mandatory onboarding documents (Max 8MB per file - Image or PDF).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span suppressHydrationWarning className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
              {isMounted ? uploadedCount : 0} / {TEACHER_DOCUMENT_TYPES.length} Documents Attached
            </span>
          </div>
        </div>

        {/* 10 DOCUMENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEACHER_DOCUMENT_TYPES.map((doc) => {
            const Icon = doc.icon;
            const docData = documents[doc.id];
            const isUploaded = !!docData;

            return (
              <div
                key={doc.id}
                className={`rounded-2xl border p-4 transition-all duration-200 space-y-3 flex flex-col justify-between ${isUploaded
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${doc.color}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{doc.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{doc.description}</p>
                      </div>
                    </div>
                    {isUploaded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 size={10} /> Uploaded
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${doc.optional ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60' : 'text-slate-400 bg-slate-200/60 dark:bg-slate-800'}`}>
                        {doc.optional ? 'Optional' : 'Pending'}
                      </span>
                    )}
                  </div>

                  {/* Uploaded File Details or Empty Dropzone */}
                  {isUploaded ? (
                    <div className="pt-2 space-y-2">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="truncate">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{docData.name}</p>
                            <p className="text-[9px] text-slate-400">{docData.size} • {docData.uploadedAt}</p>
                          </div>
                        </div>
                      </div>

                      {/* Image Thumbnail preview if image */}
                      {docData.dataUrl?.startsWith('data:image') && (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                          <img src={docData.dataUrl} alt={doc.name} className="w-full h-full object-cover" />
                          <div
                            onClick={() => setActiveDocPreview({ ...docData, title: doc.name })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-[11px] gap-1 cursor-pointer transition-opacity backdrop-blur-xs"
                          >
                            <Eye size={14} /> Preview
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1">
                      <input
                        type="file"
                        ref={el => docInputRefs.current[doc.id] = el}
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleDocUpload(doc.id, e.target.files[0])}
                      />
                      <button
                        type="button"
                        onClick={() => docInputRefs.current[doc.id]?.click()}
                        className="w-full py-3 px-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-accent dark:hover:border-accent rounded-xl text-center transition-colors bg-[#fcfbfa] dark:bg-slate-900/50 hover:bg-accent/5 flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <UploadCloud size={16} className="text-slate-400 group-hover:text-accent transition-colors" />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-accent">
                          Upload {doc.name}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                {isUploaded && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                    <button
                      type="button"
                      onClick={() => docInputRefs.current[doc.id]?.click()}
                      className="text-[10px] font-bold text-accent hover:underline cursor-pointer"
                    >
                      Replace File
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveDocPreview({ ...docData, title: doc.name })}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="View Document"
                      >
                        <Eye size={12} />
                      </button>

                      <a
                        href={docData.dataUrl}
                        download={docData.name}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Download Document"
                      >
                        <Download size={12} />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDocDelete(doc.id, doc.name);
                        }}
                        className="p-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={el => docInputRefs.current[doc.id] = el}
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocUpload(doc.id, e.target.files[0])}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation error notification banner above save button */}
      {validationError && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-xs text-rose-600 dark:text-rose-400 shadow-inner flex items-start gap-2.5 animate-fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">Profile Update Requirement</p>
            <p className="text-[11px] mt-0.5 opacity-90">{validationError}</p>
          </div>
        </div>
      )}

      {/* SAVE & UPDATE FACULTY PROFILE & VERIFICATION VAULT BUTTON */}
      <div className="flex justify-end pt-2 pb-4">
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={isSavingProfile}
          className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#FF6B2B]/25 btn-shine flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          <span>{isSavingProfile ? "Updating Profile & Vault..." : "Save & Update Faculty Vault"}</span>
        </button>
      </div>

      {/* PASSWORD RESET CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
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

      {/* DOCUMENT FULLSCREEN PREVIEW MODAL */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="text-accent" size={20} />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {activeDocPreview.title}
                  </h3>
                  <p className="text-[10px] text-slate-400">{activeDocPreview.name}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[350px]">
              {activeDocPreview.dataUrl?.startsWith('data:image') ? (
                <img
                  src={activeDocPreview.dataUrl}
                  alt={activeDocPreview.title}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md"
                />
              ) : activeDocPreview.dataUrl?.startsWith('data:application/pdf') ? (
                <iframe
                  src={activeDocPreview.dataUrl}
                  title="PDF Preview"
                  className="w-full h-[65vh] rounded-lg"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText size={48} className="mx-auto text-accent" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {activeDocPreview.name}
                  </p>
                  <a
                    href={activeDocPreview.dataUrl}
                    download={activeDocPreview.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white font-bold text-xs rounded-xl shadow hover:opacity-90 cursor-pointer"
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <a
                href={activeDocPreview.dataUrl}
                download={activeDocPreview.name}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="px-4 py-2 bg-accent text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
