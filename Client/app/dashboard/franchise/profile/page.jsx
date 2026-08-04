"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { 
  Building2, User, Mail, Phone, MapPin, ShieldCheck, 
  Key, Save, CheckCircle2, AlertCircle, RefreshCw, 
  GraduationCap, Users, Calendar, Sparkles, Clock, Globe,
  Camera, Trash2, Image as ImageIcon
} from "lucide-react";

export default function FranchiseProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState({ totalStudents: 0, activeTeachers: 0, batchesCount: 0, pendingFees: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [profilePhoto, setProfilePhoto] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: ""
  });

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, metricsRes] = await Promise.all([
        api.franchise.getProfile().catch(() => null),
        api.franchise.getDashboardMetrics().catch(() => null)
      ]);

      const profData = profileRes?.franchise || profileRes?.data || {};
      setProfile(profData);
      setProfilePhoto(profData.profilePhoto || profData.user?.profilePhoto || user?.profilePhoto || null);

      setFormData({
        name: profData.name || user?.name || "",
        phone: profData.phone || user?.phone || "",
        address: profData.address || user?.address || "",
        city: profData.user?.city || user?.city || "",
        password: "",
        confirmPassword: ""
      });

      if (metricsRes?.data) {
        setMetrics(metricsRes.data);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      setErrorMessage("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result);
      setSuccessMessage("New profile photo selected. Click 'Save Profile Changes' to update.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setSuccessMessage("Profile photo removed. Click 'Save Profile Changes' to apply.");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        profilePhoto: profilePhoto
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await api.franchise.updateProfile(payload);
      setSuccessMessage("Franchise profile updated successfully!");
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      await fetchProfileData();
      setSuccessMessage("Franchise profile updated successfully!");
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      await fetchProfileData();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const userInitials = (profile?.name || user?.name || "Franchise Admin")
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B2B]" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Franchise Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#FF6B2B]" />
            <span className="gradient-text">FRANCHISE CENTER PROFILE</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your regional training center details, operational metrics, and account credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Franchise
          </span>
        </div>
      </div>



      {/* NOTIFICATIONS / ALERTS */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: EDIT FORM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B2B]" />
                  Edit Franchise & Owner Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your academy profile information and contact details.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Profile Photo Option */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1f153d] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] p-0.5 shadow-md flex items-center justify-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile Photo"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[14px] bg-[#1a1035] flex items-center justify-center text-xl font-black text-white">
                        {userInitials}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-1.5 rounded-lg bg-[#FF6B2B] text-white shadow-lg cursor-pointer hover:bg-orange-600 transition-all" title="Upload Photo">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#FF6B2B]" />
                    Franchise Profile Photo
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload a high-resolution logo or profile picture (PNG, JPG, WEBP max 5MB).
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className="px-3 py-1.5 rounded-xl bg-[#2D1B69] hover:bg-[#3d2a88] text-white text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                      <Camera className="w-3.5 h-3.5 text-[#FFCA28]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Center Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Franchise / Center Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Pune Central Abacus Training Center"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f153d] text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#FF6B2B] transition-all"
                  />
                </div>
              </div>

              {/* Email (Read only) & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Email Address (Account ID)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={profile?.email || user?.email || ""}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#1a1035] text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Phone / Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f153d] text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#FF6B2B] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    City / Region
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Pune"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f153d] text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#FF6B2B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Full Physical Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Deccan Gymkhana, Pune"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f153d] text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#FF6B2B] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECURITY / PASSWORD SECTION */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    Change Account Password (Optional)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Leave blank if you do not wish to update your login password.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f153d] text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#FF6B2B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f153d] text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#FF6B2B] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white text-xs font-bold shadow-md shadow-[#FF6B2B]/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT OVERVIEW & QUICK INFO */}
        <div className="space-y-6">
          
          {/* ACCOUNT DETAILS CARD */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Account Metadata
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">User Role</span>
                <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[10px]">
                  FRANCHISE ADMIN
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Account ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  #{user?.id || profile?.userId || profile?.id || 1}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Franchise ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  F-{profile?.id || 1}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active / Authorized
                </span>
              </div>
            </div>
          </div>

          {/* QUICK LINKS / HELP CARD */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-[#1a1035] p-6 text-white shadow-md space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFCA28]" />
              Franchise Portal Tips
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B2B] mt-1.5 shrink-0" />
                <span>Keep your center address & phone updated to ensure accurate reports.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFCA28] mt-1.5 shrink-0" />
                <span>Teachers & Students assigned to your center will reflect in your regional analytics.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>For central support or system queries, contact Central Abacus Administration.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
