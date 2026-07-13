"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, AlertTriangle, Eye, EyeOff, ArrowRight, ArrowLeft, Star, Trophy, Users, Brain } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const features = [
  { icon: Brain, text: "Mental Math Excellence" },
  { icon: Trophy, text: "National Award Winners" },
  { icon: Users, text: "10,000+ Happy Students" },
  { icon: Star, text: "5-Star Parent Ratings" },
];

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) redirectByRole(user.role);
  }, [user]);

  const redirectByRole = (role) => {
    if (!role) return;
    switch (role.toUpperCase()) {
      case "ADMIN":     router.push("/dashboard/admin"); break;
      case "FRANCHISE": router.push("/dashboard/franchise"); break;
      case "TEACHER":   router.push("/dashboard/teacher"); break;
      case "STUDENT":   router.push("/dashboard/student"); break;
      default: setError("Unauthorized role.");
    }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const profile = await login(email, password);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        redirectByRole(profile.role);
      }, 800);
    } catch (err) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Left Panel: Brand ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1a1035 0%, #2D1B69 60%, #3d2a88 100%)" }}>

        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: "url('/images/login-background.jpg')", backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "luminosity" }} />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        {/* Blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-15 animate-blob2"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)", filter: "blur(60px)" }} />

        {/* Top: Logo */}
        <div className="relative p-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
              <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                <rect x="3" y="4" width="26" height="24" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="10" y1="4" x2="10" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <line x1="16" y1="4" x2="16" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <line x1="22" y1="4" x2="22" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <line x1="3" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1.5"/>
                <circle cx="10" cy="11" r="3" fill="white"/>
                <circle cx="16" cy="13" r="3" fill="white" fillOpacity="0.8"/>
                <circle cx="22" cy="11" r="3" fill="white"/>
                <circle cx="10" cy="22" r="3" fill="white" fillOpacity="0.5"/>
                <circle cx="16" cy="21" r="3" fill="white" fillOpacity="0.5"/>
                <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.5"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-white text-xl tracking-tight leading-none" style={{ fontFamily: "Poppins, sans-serif" }}>
                SMART <span style={{ color: "#FF6B2B" }}>ABACUS</span>
              </p>
              <p className="text-[10px] text-white/50 tracking-widest uppercase font-semibold mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                Academy ERP Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Headline */}
        <div className="relative px-10 py-8">
          <h2 className="font-black text-white text-4xl xl:text-5xl leading-tight mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            Welcome Back to<br />
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Smart Abacus
            </span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-10 max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Sign in to access your ERP portal — manage students, batches, fees, attendance and more.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,107,43,0.15)", border: "1px solid rgba(255,107,43,0.3)" }}>
                  <Icon size={16} style={{ color: "#FF6B2B" }} />
                </div>
                <span className="text-slate-200 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative p-10">
          <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#FFCA28" color="#FFCA28" />)}
            </div>
            <p className="text-slate-200 text-sm italic leading-relaxed mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
              &ldquo;Smart Abacus has completely transformed how I manage my academy. The ERP system is seamless!&rdquo;
            </p>
            <p className="text-[#FFCA28] text-xs font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
              — Franchise Owner, Pune
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#FFF8F0] dark:bg-[#150e2a] transition-colors duration-300">

        {/* Mobile Back button */}
        <div className="w-full max-w-md mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#FF6B2B] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2D1B69, #FF6B2B)" }}>
              <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                <rect x="3" y="4" width="26" height="24" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="10" cy="11" r="3" fill="white"/>
                <circle cx="16" cy="13" r="3" fill="white" fillOpacity="0.8"/>
                <circle cx="22" cy="11" r="3" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-[#2D1B69] dark:text-white text-lg leading-none" style={{ fontFamily: "Poppins, sans-serif" }}>
                SMART <span style={{ color: "#FF6B2B" }}>ABACUS</span>
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#2D1B69] dark:text-white mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Sign In
            </h1>
            <p className="text-slate-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Enter your credentials to access the portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

             {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1035] pt-6 pb-2.5 pl-12 pr-4 text-slate-800 dark:text-white text-sm placeholder-transparent focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/20 transition-all duration-200"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
              <Mail className="absolute left-4 top-[22px] h-4.5 w-4.5 text-slate-400 peer-focus:text-[#FF6B2B] transition-colors" size={18} />
              <label
                htmlFor="email"
                className="absolute left-12 top-4.5 text-slate-400 text-xs font-bold uppercase tracking-wider origin-[0] transform scale-75 -translate-y-2.5 transition-all duration-300 pointer-events-none peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-[#FF6B2B] peer-focus:text-xs"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Email Address
              </label>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Link href="/auth/forgot-password" className="ml-auto text-xs font-semibold text-[#FF6B2B] hover:text-[#e55a1f] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1035] pt-6 pb-2.5 pl-12 pr-12 text-slate-800 dark:text-white text-sm placeholder-transparent focus:outline-none focus:border-[#FF6B2B] focus:ring-4 focus:ring-[#FF6B2B]/20 transition-all duration-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <Lock className="absolute left-4 top-[22px] h-4.5 w-4.5 text-slate-400 peer-focus:text-[#FF6B2B] transition-colors" size={18} />
                <label
                  htmlFor="password"
                  className="absolute left-12 top-4.5 text-slate-400 text-xs font-bold uppercase tracking-wider origin-[0] transform scale-75 -translate-y-2.5 transition-all duration-300 pointer-events-none peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-[#FF6B2B] peer-focus:text-xs"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[22px] text-slate-400 hover:text-[#FF6B2B] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="btn-shine w-full rounded-2xl py-4 font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                  Signing In...
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-bold text-[#2D1B69] hover:text-[#FF6B2B] transition-colors">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  
}
