"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to send OTP. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 pt-24 pb-10 px-8 relative overflow-hidden font-sans antialiased">
      {/* Decorative Blurs */}
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-blue-300/30 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-purple-300/30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-200 p-8">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="group mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Login</span>
        </button>

        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
            S
          </div>
          <h2 className="mt-4 text-3xl font-black text-blue-700 tracking-wide">
            SMART <span className="text-indigo-600">ABACUS</span>
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-bold tracking-widest uppercase">
            Security Verification
          </p>
        </div>

        {error && (
          <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-600 animate-pulse">
            <span className="text-lg">✔</span>
            <p className="text-sm font-semibold">OTP sent successfully! Redirecting to verification...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartabacus.com"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-xs font-semibold text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <span>{loading ? "Sending OTP..." : "Request Reset OTP"}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
