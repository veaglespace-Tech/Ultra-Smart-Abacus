"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Trash2, User, Mail, Phone, UserCheck,
  FileText, IdCard, Users, Home, ClipboardList, Receipt,
  UploadCloud, Eye, Download, CheckCircle2, AlertCircle, X, ShieldCheck, FileCheck, Loader2
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { storageService } from "@/services/storage.services";

const DOCUMENT_TYPES = [
  { id: "studentPhoto", name: "Student Photo", description: "Recent passport size photo of student", icon: Camera, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  { id: "birthCertificate", name: "Birth Certificate", description: "Official Birth Certificate or DOB proof", icon: FileText, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800" },
  { id: "studentAadhaar", name: "Student Aadhaar Card", description: "Student UIDAI Aadhaar card photo/PDF", icon: IdCard, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  { id: "parentAadhaar", name: "Parent Aadhaar Card", description: "Father or Mother Aadhaar card photo/PDF", icon: Users, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  { id: "addressProof", name: "Address Proof", description: "Electricity bill, Ration card, or Rent agreement", icon: Home, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" },
  { id: "admissionForm", name: "Admission Form", description: "Signed admission form / registration paper", icon: ClipboardList, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" },
  { id: "feeReceipt", name: "Fee Payment Receipt", description: "Enrollment fee transaction receipt", icon: Receipt, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800" },
];

export default function StudentProfilePage() {
  const { user, setUser, updateProfile } = useAuth();

  // Mock student profile data fallback
  const profile = {
    name: user?.name || "Prajwal Gunjal",
    email: user?.email || "prajwal@gmail.com",
    phone: user?.phone || "+91 9876543210",
    parentName: user?.parentGuardianName || user?.fatherName || "Ramesh Gunjal",
    rollNo: "STU-2026-001",
    level: "Level 1 (Foundation)",
    batch: "Afternoon Batch (3 PM - 4 PM)",
    center: "Main Academy Center",
    joinedDate: "January 15, 2026",
    id: user?.id || 1,
    profilePhoto: user?.profilePhoto || null,
  };

  const fileInputRef = useRef(null);
  const docInputRefs = useRef({});

  // Student Profile Photo State
  const [profileImage, setProfileImage] = useState(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editParentName, setEditParentName] = useState("");

  const [savedFields, setSavedFields] = useState({
    name: "",
    email: "",
    phone: "",
    parentName: ""
  });

  const [isMounted, setIsMounted] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  // Helper to save documents reliably across local storage, session storage AND backend MySQL DB
  const saveDocumentsToStorage = async (updatedDocs) => {
    try {
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('abacus_student_documents', JSON.stringify(updatedDocs)); } catch (e) { }
        try { localStorage.setItem('abacus_student_documents', JSON.stringify(updatedDocs)); } catch (e) { }
      }

      const currentUser = user || (typeof window !== 'undefined' ? storageService.getUser() : null);
      const updatedUser = {
        ...(currentUser || {}),
        documents: updatedDocs
      };
      if (setUser) setUser(updatedUser);
      if (storageService?.setUser) storageService.setUser(updatedUser);
      if (updateProfile) updateProfile({ documents: updatedDocs });

      // Direct Sync with Backend Server API DB
      const targetId = profile?.id || profile?.rawId || currentUser?.student?.id || currentUser?.id;
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
    setIsMounted(true);
    const currentUser = user || (typeof window !== 'undefined' ? storageService.getUser() : null);
    const storedPhoto = typeof window !== 'undefined'
      ? (storageService.get('abacus_student_profile_photo') || storageService.get('student_profile_photo'))
      : null;
    const photoToSet = storedPhoto || currentUser?.profilePhoto || profile.profilePhoto || null;
    if (photoToSet) {
      setProfileImage(photoToSet);
    }

    const storedPersonal = typeof window !== 'undefined' ? storageService.get('abacus_student_personal_fields') : null;
    const initialName = storedPersonal?.name || currentUser?.name || profile.name || "";
    const initialEmail = storedPersonal?.email || currentUser?.email || profile.email || "";
    const initialPhone = storedPersonal?.phone || currentUser?.phone || profile.phone || "";
    const initialParent = storedPersonal?.parentName || currentUser?.parentGuardianName || currentUser?.fatherName || profile.parentName || "";

    setEditName(initialName);
    setEditEmail(initialEmail);
    setEditPhone(initialPhone);
    setEditParentName(initialParent);

    setSavedFields({
      name: initialName,
      email: initialEmail,
      phone: initialPhone,
      parentName: initialParent
    });

    // 1. Restore from local and session storage synchronously
    try {
      let mergedDocs = {};
      if (typeof window !== 'undefined') {
        const sessionItem = sessionStorage.getItem('abacus_student_documents');
        if (sessionItem) {
          try { mergedDocs = mergeDocs(mergedDocs, JSON.parse(sessionItem)); } catch (e) { }
        }
        const localItem = localStorage.getItem('abacus_student_documents');
        if (localItem) {
          try { mergedDocs = mergeDocs(mergedDocs, JSON.parse(localItem)); } catch (e) { }
        }
      }

      mergedDocs = mergeDocs(mergedDocs, currentUser?.documents);
      mergedDocs = mergeDocs(mergedDocs, currentUser?.student?.documents);

      if (Object.keys(mergedDocs).length > 0) {
        setDocuments(prev => mergeDocs(prev, mergedDocs));
      }
    } catch (e) {
      console.warn("Could not load local documents:", e);
    }

    // 2. Fetch directly from Backend MySQL Database to guarantee permanent persistence
    const fetchBackendDocuments = async () => {
      try {
        const token = storageService.getToken();
        if (!token) return;
        const targetId = profile?.id || profile?.rawId || currentUser?.student?.id || currentUser?.id;
        const url = targetId
          ? `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/${targetId}`
          : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/profile`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const studentData = data?.data || data?.student;
        let dbDocs = studentData?.documents;
        if (typeof dbDocs === 'string') {
          try { dbDocs = JSON.parse(dbDocs); } catch (e) { }
        }
        if (dbDocs && typeof dbDocs === 'object') {
          setDocuments(prev => mergeDocs(prev, dbDocs));
          if (typeof window !== 'undefined') {
            try { sessionStorage.setItem('abacus_student_documents', JSON.stringify(dbDocs)); } catch (e) { }
            try { localStorage.setItem('abacus_student_documents', JSON.stringify(dbDocs)); } catch (e) { }
          }
        }
      } catch (err) {
        console.warn("Backend document fetch warning:", err);
      }
    };

    fetchBackendDocuments();
  }, [user]);

  const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const _publicBase = _apiUrl.replace(/\/api\/?$/, "");

  const _rawPhoto = profileImage || (isMounted && typeof window !== 'undefined' ? (storageService.get('abacus_student_profile_photo') || storageService.get('student_profile_photo')) : null) || user?.profilePhoto || null;
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
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX = 250;
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

          setProfileImage(compressedDataUrl);
          setValidationError("");

          // Save photo in dedicated local storage keys
          if (storageService?.set) {
            storageService.set('abacus_student_profile_photo', compressedDataUrl);
            storageService.set('student_profile_photo', compressedDataUrl);
          }

          if (updateProfile) updateProfile({ profilePhoto: compressedDataUrl });

          const updatedUser = {
            ...(user || {}),
            profilePhoto: compressedDataUrl
          };
          if (setUser) setUser(updatedUser);
          if (storageService?.setUser) storageService.setUser(updatedUser);

          // Direct Backend Sync to MySQL Student Table
          const targetId = profile?.id || profile?.rawId || user?.student?.id || user?.id;
          if (targetId) {
            const token = storageService.getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/${targetId}`, {
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
        storageService.set('abacus_student_profile_photo', null);
        storageService.set('student_profile_photo', null);
      }
      if (updateProfile) updateProfile({ profilePhoto: null });

      const updatedUser = {
        ...(user || {}),
        profilePhoto: null
      };
      if (setUser) setUser(updatedUser);
      if (storageService?.setUser) storageService.setUser(updatedUser);

      // Direct Backend Sync to MySQL Student Table
      const targetId = profile?.id || profile?.rawId || user?.student?.id || user?.id;
      if (targetId) {
        const token = storageService.getToken();
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"}/students/${targetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePhoto: null }),
        }).catch(err => console.warn("API profilePhoto sync warning:", err));
      }

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
        setTimeout(() => saveDocumentsToStorage(updated), 0);
        return updated;
      });

      setValidationError("");
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

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setValidationError("");

    // Strict validation: Require all fields, profile photo, and documents to be present
    const missingItems = [];
    if (!editName || !editName.trim()) missingItems.push("Full Name");
    if (!editEmail || !editEmail.trim()) missingItems.push("Registered Email");
    if (!editPhone || !editPhone.trim()) missingItems.push("Contact Number");
    if (!editParentName || !editParentName.trim()) missingItems.push("Parent / Guardian Name");
    if (!profileImage && !resolvedProfilePhoto) missingItems.push("Profile Photo");

    DOCUMENT_TYPES.forEach(doc => {
      if (!documents[doc.id]) {
        missingItems.push(doc.name);
      }
    });

    if (missingItems.length > 0) {
      setValidationError(`All profile details and document records must be filled before submitting. Missing (${missingItems.length}): ${missingItems.join(", ")}`);
      return;
    }

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

      const newSaved = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
      };
      setSavedFields(newSaved);
      if (typeof window !== 'undefined') {
        try { storageService.set('abacus_student_personal_fields', newSaved); } catch (e) { }
      }
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

  const handleSavePersonalRecords = async (e) => {
    if (e) e.preventDefault();
    setValidationError("");

    const missingFields = [];
    if (!editName || !editName.trim()) missingFields.push("Full Name");
    if (!editEmail || !editEmail.trim()) missingFields.push("Registered Email");
    if (!editPhone || !editPhone.trim()) missingFields.push("Contact Number");
    if (!editParentName || !editParentName.trim()) missingFields.push("Parent / Guardian Name");

    if (missingFields.length > 0) {
      setValidationError(`Please fill out: ${missingFields.join(", ")}`);
      return;
    }

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
            parentName: editParentName,
          }),
        }).catch(err => console.warn("API personal records update warning:", err));
      }

      updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
      });

      const currentUser = user || (typeof window !== 'undefined' ? storageService.getUser() : null);
      const updatedUser = {
        ...(currentUser || {}),
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentGuardianName: editParentName,
        fatherName: editParentName,
      };
      if (setUser) setUser(updatedUser);
      if (storageService?.setUser) storageService.setUser(updatedUser);

      const newSaved = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        parentName: editParentName,
      };
      setSavedFields(newSaved);
      if (typeof window !== 'undefined') {
        try { storageService.set('abacus_student_personal_fields', newSaved); } catch (e) { }
      }

    } catch (err) {
      console.error("Personal records save error:", err);
    } finally {
      setIsSaving(false);
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.5 }
      });
      setProfileSuccess("Personal Profile Records Successfully Saved!");
      setTimeout(() => setProfileSuccess(""), 3000);
    }
  };

  const uploadedCount = Object.values(documents).filter(Boolean).length;

  const isModified = isMounted && (
    (editName !== savedFields.name) ||
    (editEmail !== savedFields.email) ||
    (editPhone !== savedFields.phone) ||
    (editParentName !== savedFields.parentName)
  );

  return (
    <div className="space-y-4">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight">
            <span className="gradient-text">STUDENT PROFILE</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage academic records, personal information, admission verification documents, and contact details.
          </p>
        </div>
      </div>

      {/* Success notification banner */}
      {profileSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-350 shadow-inner flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{profileSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch animate-fade-in">

        {/* Visual profile detail summary card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col items-center text-center shadow-sm">
          <div className="relative w-20 h-20 mb-1.5">
            {resolvedProfilePhoto ? (
              <img
                src={resolvedProfilePhoto}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-amber-500/20 shadow-inner"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {profile.name.charAt(0)}
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
              className="absolute bottom-0 right-0 p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-105"
              title="Change Photo"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* ACTION BUTTONS FOR PHOTO */}
          <div className="flex items-center gap-2 my-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Camera size={12} />
              <span>{resolvedProfilePhoto ? 'Change' : 'Upload'}</span>
            </button>

            {resolvedProfilePhoto && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Delete Photo"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{editName || profile.name}</h3>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5">{profile.rollNo}</span>

          <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 space-y-2.5 text-xs text-left mt-auto">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Course Level</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Assigned Batch</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Registered Center</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.center}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Document Vault</span>
              <span suppressHydrationWarning className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 dark:border-emerald-800">
                {isMounted ? uploadedCount : 0} / {DOCUMENT_TYPES.length} Uploaded
              </span>
            </div>
          </div>
        </div>

        {/* Static Personal Records Profile Information card */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-7 shadow-sm flex flex-col justify-between">
          <div className="h-full flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} className="text-amber-500" />
                  <h3 className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                    Personal Records Profile Information
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-500" /> Verified Records (Read-Only)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 text-xs font-semibold">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider text-[10px] font-bold">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none">
                    <User size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={editName || profile.name}
                      readOnly
                      disabled
                      className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider text-[10px] font-bold">
                    Registered Email
                  </label>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={editEmail || profile.email}
                      readOnly
                      disabled
                      className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider text-[10px] font-bold">
                    Contact Number
                  </label>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={editPhone || profile.phone}
                      readOnly
                      disabled
                      className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider text-[10px] font-bold">
                    Parent / Guardian Name
                  </label>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none">
                    <Users size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={editParentName || profile.parentName}
                      readOnly
                      disabled
                      className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>* Official admission records (Locked). Contact administration to edit.</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified Profile Info</span>
            </div>
          </div>
        </div>

      </div>

      {/* STUDENT DOCUMENT VAULT & RECORDS VERIFICATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
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
            <span suppressHydrationWarning className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              {isMounted ? uploadedCount : 0} / {DOCUMENT_TYPES.length} Files Attached
            </span>
          </div>
        </div>

        {/* 7 DOCUMENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DOCUMENT_TYPES.map((doc) => {
            const Icon = doc.icon;
            const docData = documents[doc.id];
            const isUploaded = !!docData;

            return (
              <div
                key={doc.id}
                className={`rounded-2xl border p-4 transition-all duration-200 space-y-3 flex flex-col justify-between ${isUploaded
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

      {/* Validation error notification banner above bottom button */}
      {validationError && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-xs text-rose-600 dark:text-rose-400 shadow-inner flex items-start gap-2.5 animate-fade-in my-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">Cannot Update Profile Yet</p>
            <p className="text-[11px] mt-0.5 opacity-90">{validationError}</p>
          </div>
        </div>
      )}

      {/* UPDATE STUDENT PROFILE BUTTON AT THE VERY END */}
      <div className="flex justify-end pt-2 pb-4">
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#FF6B2B]/25 btn-shine flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          <span>{isSaving ? "Updating Profile..." : "Submit  Student Profile"}</span>
        </button>
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
