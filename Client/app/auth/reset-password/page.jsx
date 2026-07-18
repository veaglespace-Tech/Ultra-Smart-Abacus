"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ArrowLeft, KeyRound, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#eceffd] px-4 overflow-hidden font-sans antialiased">
      {/* Background Radial Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-200/60 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/50 blur-[130px] pointer-events-none z-0"></div>

      {/* Main Glassmorphism Container Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-8 shadow-xl shadow-indigo-100/40 relative z-10">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/auth/forgot-password")}
          className="group mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">
              SMART <span className="text-indigo-600">ABACUS</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Class Management System</p>
          
          <div className="mt-4 text-center">
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-indigo-100/60">
              Security Portal
            </span>
            <h2 className="text-lg font-black text-slate-800 mt-3 tracking-tight">Reset Password</h2>
            <p className="text-xs text-slate-500 mt-1">Verify OTP and enter your new password</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-red-600 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-emerald-600 text-xs animate-pulse">
            <span>✔</span>
            <p className="font-semibold">Password updated successfully! Redirecting to login...</p>
          </div>
        )}

        {/* Input Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Email Address
            </label>
            <input 
              type="email" 
              required
              readOnly={!!emailParam}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@smartabacus.com"
              className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all read-only:bg-slate-100/50 read-only:text-slate-500"
            />
          </div>

          {/* OTP Verification Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Enter 6-Digit OTP
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-800 tracking-[0.25em] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-indigo-600 transition-colors border-0 bg-transparent"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Submit Button */}
          <button 
            type="submit" 
            disabled={loading || success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 active:scale-[0.99] transition-all mt-6 cursor-pointer border-0"
          >
            {loading ? "Updating..." : "Update Password"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Navigation Link Back to Login */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-medium">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
