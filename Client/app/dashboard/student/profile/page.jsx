"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Trash2, User, Mail, Phone, UserCheck,
  FileText, IdCard, Users, Home, ClipboardList, Receipt,
  UploadCloud, Eye, Download, CheckCircle2, AlertCircle, X, ShieldCheck, FileCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { useStudentData } from "../StudentContext";
import { storageService } from "@/services/storage.services";
import { useAuth } from "@/context/AuthContext";

const DOCUMENT_TYPES = [
  { id: 'studentPhoto', name: 'Student Photo', description: 'Recent passport size photo of student', icon: Camera, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  { id: 'birthCertificate', name: 'Birth Certificate', description: 'Official Birth Certificate or DOB proof', icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  { id: 'studentAadhaar', name: 'Student Aadhaar Card', description: 'Student UIDAI Aadhaar card photo/PDF', icon: IdCard, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { id: 'parentAadhaar', name: 'Parent Aadhaar Card', description: 'Parent / Guardian Aadhaar card photo/PDF', icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
  { id: 'addressProof', name: 'Address Proof', description: 'Electricity bill, Ration card, or Rent agreement', icon: Home, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { id: 'admissionForm', name: 'Admission Form', description: 'Signed academy admission application form', icon: ClipboardList, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { id: 'feeReceipt', name: 'Fee Payment Receipt', description: 'Official tuition / admission fee receipt', icon: Receipt, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' },
];

export default function StudentProfilePage() {
  const { profile, updateProfile } = useStudentData();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const docInputRefs = useRef({});

  const [profileImage, setProfileImage] = useState(profile.profilePhoto || user?.profilePhoto || null);

  // Edit Profile form states
  const [editName, setEditName] = useState(profile.name || "");
  const [editEmail, setEditEmail] = useState(profile.email || "");
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [editParentName, setEditParentName] = useState(profile.parentName || "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Student Document Vault State
  const [documents, setDocuments] = useState({
    studentPhoto: null,
    birthCertificate: null,
    studentAadhaar: null,
    parentAadhaar: null,
    addressProof: null,
    admissionForm: null,
    feeReceipt: null,
  });

  const [activeDocPreview, setActiveDocPreview] = useState(null);

  // Helper to save documents reliably across multiple local keys AND backend MySQL DB
  const saveDocumentsToStorage = async (updatedDocs) => {
    try {
      const keysToSave = [
        `student_docs_${user?.email?.toLowerCase() || 'main'}`,
        `student_docs_${user?.id || 'main'}`,
        `student_docs_${profile?.id || 'main'}`,
        `student_docs_global`
      ];
      keysToSave.forEach(k => {
        if (storageService?.set) storageService.set(k, updatedDocs);
      });

      const updatedUser = {
        ...(user || {}),
        documents: updatedDocs
      };
      if (setUser) setUser(updatedUser);
      if (storageService?.setUser) storageService.setUser(updatedUser);
      if (updateProfile) updateProfile({ documents: updatedDocs });

      // Direct Sync with Backend Server API DB
      const targetId = profile?.id || profile?.rawId || user?.student?.id || user?.id;
      if (targetId) {
        const token = storageService.getToken();
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/${targetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ documents: updatedDocs }),
        }).catch(err => console.warn("API documents sync warning:", err));
      }
    } catch (err) {
      console.warn("Storage save warning:", err);
    }
  };

  useEffect(() => {
    setProfileImage(profile.profilePhoto || user?.profilePhoto || null);
    setEditName(profile.name || user?.name || "");
    setEditEmail(profile.email || user?.email || "");
    setEditPhone(profile.phone || user?.phone || "");
    setEditParentName(profile.parentName || user?.parentGuardianName || user?.fatherName || "");

    // Multi-source document retrieval on load/refresh
    try {
      const keysToTry = [
        `student_docs_${user?.email?.toLowerCase() || 'main'}`,
        `student_docs_${user?.id || 'main'}`,
        `student_docs_${profile?.id || 'main'}`,
        `student_docs_global`
      ];

      let mergedDocs = {};
      keysToTry.forEach(k => {
        const found = storageService?.get ? storageService.get(k) : null;
        if (found && typeof found === 'object') {
          mergedDocs = { ...mergedDocs, ...found };
        }
      });

      if (user?.documents && typeof user.documents === 'object') {
        mergedDocs = { ...mergedDocs, ...user.documents };
      }
      if (profile?.documents && typeof profile.documents === 'object') {
        mergedDocs = { ...mergedDocs, ...profile.documents };
      }

      if (Object.keys(mergedDocs).length > 0) {
        setDocuments(prev => ({ ...prev, ...mergedDocs }));
      }
    } catch (e) {
      console.warn("Could not load documents from storage:", e);
    }
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

  // Compress image before saving to fit within localStorage limits reliably
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
        saveDocumentsToStorage(updated);
        return updated;
      });

      setProfileSuccess(`${DOCUMENT_TYPES.find(d => d.id === docId)?.name || 'Document'} uploaded successfully!`);
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
    if (window.confirm(`Are you sure you want to delete ${docName}?`)) {
      setDocuments(prev => {
        const updated = { ...prev, [docId]: null };
        saveDocumentsToStorage(updated);
        return updated;
      });
      if (docInputRefs.current[docId]) {
        docInputRefs.current[docId].value = "";
      }
      setProfileSuccess(`${docName} removed.`);
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = storageService.getToken();
      const targetId = profile?.id || profile?.rawId || user?.student?.id || user?.id;

      if (targetId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/${targetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone: editPhone,
            fatherName: editParentName,
            profilePhoto: profileImage,
            documents: documents
          }),
        }).catch(err => console.warn("API update warning:", err));
      }

      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
        profilePhoto: profileImage,
        documents: documents
      });

      const updatedUser = {
        ...(user || {}),
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentGuardianName: editParentName,
        fatherName: editParentName,
        profilePhoto: profileImage,
        documents: documents
      };
      if (setUser) setUser(updatedUser);
      storageService.setUser(updatedUser);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
      setProfileSuccess("Student Profile & Records Successfully Updated!");
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  const initials = (editName || profile.name)
    ? (editName || profile.name).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  const uploadedCount = Object.values(documents).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">STUDENT PROFILE HUB</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Manage personal profile details, contact information, and student document vault.</p>
        </div>
      </div>

      {/* Profile modification success message */}
      {profileSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-350 shadow-inner flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span className="font-semibold">{profileSuccess}</span>
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
          
          <h3 className="text-base font-bold text-slate-955 dark:text-white">{editName || profile.name}</h3>
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
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Document Vault</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{uploadedCount} / {DOCUMENT_TYPES.length} Uploaded</span>
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

      {/* STUDENT DOCUMENT VAULT & VERIFICATION REPOSITORY */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide flex items-center gap-2">
              <FileCheck size={18} className="text-accent" />
              <span>Student Document Vault & Records Verification</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload and manage all official student admission documents (Max 8MB per file - Image or PDF).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              {uploadedCount} / {DOCUMENT_TYPES.length} Files Attached
            </span>
          </div>
        </div>

        {/* 7 DOCUMENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENT_TYPES.map((doc) => {
            const Icon = doc.icon;
            const docData = documents[doc.id];
            const isUploaded = !!docData;

            return (
              <div 
                key={doc.id}
                className={`rounded-2xl border p-4 transition-all duration-200 space-y-3 flex flex-col justify-between ${
                  isUploaded 
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20' 
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                        Pending
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
                        className="w-full py-3 px-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-accent dark:hover:border-accent rounded-xl text-center transition-colors bg-white/50 dark:bg-slate-900/50 hover:bg-accent/5 flex items-center justify-center gap-2 group cursor-pointer"
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
                        onClick={() => handleDocDelete(doc.id, doc.name)}
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
