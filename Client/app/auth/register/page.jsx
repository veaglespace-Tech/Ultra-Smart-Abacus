"use client";
import React, { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  UserCheck,
  Share2,
  Copy,
  Check,
  Camera,
  GraduationCap,
  Briefcase,
  BookOpen,
  ShieldCheck
} from "lucide-react";

/* ─── Visual Role Cards ─── */
const roles = [
  {
    value: "STUDENT",
    label: "Student",
    icon: GraduationCap,
    desc: "I want to enroll in courses",
    color: "#2D1B69",
    bg: "rgba(45,27,105,0.08)",
  },
  {
    value: "TEACHER",
    label: "Teacher",
    icon: BookOpen,
    desc: "I teach at this academy",
    color: "#FF6B2B",
    bg: "rgba(255,107,43,0.08)",
  },
  {
    value: "FRANCHISE",
    label: "Franchise Admin",
    icon: Briefcase,
    desc: "I run a franchise centre",
    color: "#FFCA28",
    bg: "rgba(255,202,40,0.1)",
  },
  {
    value: "ADMIN",
    label: "System Admin",
    icon: ShieldCheck,
    desc: "Super administrator access",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
  },
];

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const invitedRole = ["STUDENT", "TEACHER", "FRANCHISE", "ADMIN"].includes(roleParam?.toUpperCase())
    ? roleParam.toUpperCase()
    : null;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedRole, setCopiedRole] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileCode: "+91",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    gender: "MALE",
    city: "",
    address: "",
    role: invitedRole || "STUDENT",
    parentGuardianName: "",
    dateOfBirth: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleValue) => {
    if (!roleParam) setFormData((prev) => ({ ...prev, role: roleValue }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
      const formPayload = new FormData();
      formPayload.append("fullName", formData.fullName);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      formPayload.append("role", formData.role);
      if (formData.role === "STUDENT") {
        formPayload.append("parentGuardianName", formData.parentGuardianName);
        formPayload.append("dateOfBirth", formData.dateOfBirth);
      }
      if (formData.mobileCode && formData.mobileNumber) {
        formPayload.append("phone", `${formData.mobileCode} ${formData.mobileNumber}`);
      }
      formPayload.append("gender", formData.gender);
      formPayload.append("city", formData.city);
      formPayload.append("address", formData.address);
      if (profilePhoto) {
        formPayload.append("profilePhoto", profilePhoto);
      }
         console.log("===== FORM DATA =====");

for (const pair of formPayload.entries()) {
    console.log(pair[0], pair[1]);
}

console.log("=====================");
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        body: formPayload
      });
      // const resData = await response.json();
      // if (!response.ok) throw new Error(resData.message || "Registration failed");
      const resData = await response.json();

console.log("Response:", resData);

if (!response.ok) {
    console.log("Validation Error:", resData);

    if (resData.errors) {
        alert(resData.errors.map(err => err.message).join("\n"));
    } else {
        alert(resData.message);
    }

    return;
}
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        alert("Registration completed successfully!");
        window.location.href = "/auth/login";
      }, 1000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => r.value === formData.role);

  const inputClass = "w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200";

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Left: Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1a1035 0%, #2D1B69 60%, #3d2a88 100%)" }}>
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: "url('/images/register.jpg')", backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "luminosity" }} />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />

        {/* Logo */}
        <div className="relative p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
              <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                <rect x="3" y="4" width="26" height="24" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="10" cy="11" r="3" fill="white"/>
                <circle cx="16" cy="13" r="3" fill="white" fillOpacity="0.8"/>
                <circle cx="22" cy="11" r="3" fill="white"/>
                <circle cx="10" cy="22" r="3" fill="white" fillOpacity="0.5"/>
                <circle cx="16" cy="21" r="3" fill="white" fillOpacity="0.5"/>
                <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.5"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-white text-xl leading-none" style={{ fontFamily: "Poppins, sans-serif" }}>
                SMART <span style={{ color: "#FF6B2B" }}>ABACUS</span>
              </p>
              <p className="text-[10px] text-white/50 tracking-widest uppercase font-semibold mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                Member Registration
              </p>
            </div>
          </Link>
        </div>

        {/* Content */}
       <div className="relative flex flex-col justify-start items-start h-full px-10 pt-10">
          <h2 className="font-black text-white text-4xl leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Join the Smart<br />
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Abacus Family
            </span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-xs" style={{ fontFamily: "Inter, sans-serif" }}>
            Register as a student, teacher, or franchise administrator and unlock the full power of our ERP system.
          </p>

          {/* Perks */}
          {[
            "Free Demo Session on registration",
            "Personalized learning dashboard",
            "Real-time progress tracking",
            "Expert certified instructors",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
                <Check size={11} color="white" />
              </div>
              <span className="text-slate-300 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto bg-[#FFF8F0] dark:bg-[#150e2a] transition-colors duration-300">

        {/* Back Link */}
        <div className="w-full max-w-xl mb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#FF6B2B] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-xl bg-white dark:bg-[#1a1035] rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6">

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-black text-[#2D1B69] dark:text-white mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
              Create Account
            </h1>
            <p className="text-slate-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Fill in your details to register as a member
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Profile Photo Uploader */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#FF6B2B]/40 bg-[#FF6B2B]/5 flex items-center justify-center overflow-hidden relative group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#FF6B2B] transition-colors" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Upload Profile Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {/* ── Role Selector Cards ── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
                I am a... {roleParam && <span className="text-[#FF6B2B] ml-1">(Locked via Invite)</span>}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ value, label, icon: Icon, desc, color, bg }) => {
                  const isSelected = formData.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!!roleParam && formData.role !== value}
                      onClick={() => handleRoleSelect(value)}
                      className={`relative p-3 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none ${isSelected ? "" : "bg-white dark:bg-[#150e2a] border-slate-200 dark:border-slate-800"}`}
                      style={{
                        borderColor: isSelected ? color : "",
                        background: isSelected ? bg : "",
                        opacity: roleParam && formData.role !== value ? 0.4 : 1,
                        cursor: roleParam && formData.role !== value ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: color }}>
                          <Check size={9} color="white" />
                        </div>
                      )}
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-2"
                        style={{ background: bg }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {label}
                      </p>
                      <p className="text-slate-400 dark:text-slate-400 text-[10px] leading-tight">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Name */}
            <div className="relative">
              {/* <input
                type="text"
                name="fullName"
                id="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder=" " */}
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    console.log(e.target.value);
                    handleChange(e);
                  }}
                  placeholder="Enter your full name"
                  className="peer w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] pt-5 pb-2 pl-12 pr-4 text-slate-800 dark:text-white text-sm placeholder-transparent focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              <User className="absolute left-4 top-[22px] text-slate-400 peer-focus:text-[#FF6B2B] transition-colors" size={18} />
              <label
                htmlFor="fullName"
                className="absolute left-12 top-4.5 text-slate-400 text-xs font-bold uppercase tracking-wider origin-[0] transform scale-75 -translate-y-2.5 transition-all duration-300 pointer-events-none peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-[#FF6B2B] peer-focus:text-xs"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Full Name
              </label>
            </div>

            {/* Parent/Guardian Name (Only visible for STUDENT role) */}
            {formData.role === "STUDENT" && (
              <div className="relative">
                <input
                  type="text"
                  name="parentGuardianName"
                  id="parentGuardianName"
                  required
                  value={formData.parentGuardianName || ""}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] pt-6 pb-2.5 pl-12 pr-4 text-slate-800 dark:text-white text-sm placeholder-transparent focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <User className="absolute left-4 top-[22px] text-slate-400 peer-focus:text-[#FF6B2B] transition-colors" size={18} />
                <label
                  htmlFor="parentGuardianName"
                  className="absolute left-12 top-4.5 text-slate-400 text-xs font-bold uppercase tracking-wider origin-[0] transform scale-75 -translate-y-2.5 transition-all duration-300 pointer-events-none peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-[#FF6B2B] peer-focus:text-xs"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Parent / Guardian Name
                </label>
              </div>
            )}

            {/* Date of Birth (Only visible for STUDENT role) */}
            {formData.role === "STUDENT" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] py-3 text-slate-800 dark:text-white text-sm px-4 focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-250"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              </div>
            )}

            {/* Email + Mobile Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] pt-5 pb-2 pl-12 pr-4 text-slate-800 dark:text-white text-sm placeholder-transparent focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <Mail className="absolute left-4 top-[20px] text-slate-400 peer-focus:text-[#FF6B2B] transition-colors" size={18} />
                <label
                  htmlFor="email"
                  className="absolute left-12 top-4.5 text-slate-400 text-xs font-bold uppercase tracking-wider origin-[0] transform scale-75 -translate-y-2.5 transition-all duration-300 pointer-events-none peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-[#FF6B2B] peer-focus:text-xs"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Email
                </label>
              </div>

              <div className="flex">
                <select
                  name="mobileCode"
                  value={formData.mobileCode}
                  onChange={handleChange}
                  className="w-20 h-[54px] rounded-l-2xl border-2 border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] text-slate-700 dark:text-slate-200 text-sm px-2 focus:outline-none focus:border-[#FF6B2B] transition-all"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full rounded-r-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] pt-6 pb-2.5 pl-10 pr-3 text-slate-800 dark:text-white text-sm placeholder-transparent focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  <Phone className="absolute left-3 top-[22px] text-slate-400 peer-focus:text-[#FF6B2B] transition-colors" size={16} />
                  <label
                    htmlFor="mobileNumber"
                    className="absolute left-10 top-4.5 text-slate-400 text-xs font-bold uppercase tracking-wider origin-[0] transform scale-75 -translate-y-2.5 transition-all duration-300 pointer-events-none peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-[#FF6B2B] peer-focus:text-xs"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Mobile
                  </label>
                </div>
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
             
                    <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
          </div>

                        <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Repeat Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
          </div>
          </div>
                      {/* Gender + City Row */}
           <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="relative">
  <label
    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
    style={{ fontFamily: "Outfit, sans-serif" }}
  >
    Gender
  </label>

  <User className="absolute left-4 top-[43px] text-slate-400" size={18} />

  <select
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    className="w-full h-[54px] rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-4 text-slate-800 text-sm focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 appearance-none"
  >
    <option value="MALE">Male</option>
    <option value="FEMALE">Female</option>
    <option value="OTHER">Other</option>
  </select>
</div>
              <div className="relative">
  <label
    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
    style={{ fontFamily: "Outfit, sans-serif" }}
  >
    City
  </label>

  <Building className="absolute left-4 top-[43px] text-slate-400" size={18} />

  <input
    type="text"
    name="city"
    value={formData.city}
    onChange={handleChange}
    placeholder="Enter City"
    className="w-full h-[54px] rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-4 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10"
  />
</div>
</div>
            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-355 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  rows={1}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter current address..."
                  className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150e2a] py-3.5 pl-12 pr-4 text-slate-800 dark:text-white text-sm placeholder-slate-450 focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all resize-none"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full rounded-2xl py-3 font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
              style={{
                background: "linear-gradient(135deg, #FF6B2B, #e55a1f)",
                boxShadow: "0 6px 20px rgba(255,107,43,0.35)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Registering...
                </span>
              ) : (
                <>Complete Registration <ArrowRight size={16} /></>
              )}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-slate-500 pt-2" style={{ fontFamily: "Inter, sans-serif" }}>
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-[#2D1B69] hover:text-[#FF6B2B] transition-colors">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF8F0" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-pulse" style={{ background: "linear-gradient(135deg, #2D1B69, #FF6B2B)" }} />
          <p className="font-bold text-slate-600" style={{ fontFamily: "Inter, sans-serif" }}>Loading registration...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
