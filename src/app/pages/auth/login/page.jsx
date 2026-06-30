"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, AlertTriangle, KeyRound, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const redirectByRole = (role) => {
    if (!role) return;
    switch (role.toUpperCase()) {
      case "ADMIN":
        router.push("/dashboard/admin");
        break;
      case "FRANCHISE":
        router.push("/dashboard/franchise");
        break;
      case "TEACHER":
        router.push("/dashboard/teacher");
        break;
      case "STUDENT":
        router.push("/dashboard/student");
        break;
      default:
        setError("Unauthorized role type dynamic mapping failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await login(email, password);
      redirectByRole(profile.role);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (roleEmail) => {
    setEmail(roleEmail);
    setPassword("password");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#eceffd] px-4 overflow-hidden font-sans antialiased">
   
      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]"></div>
      <div className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]"></div>

      {/* Main Glassmorphism Container Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-8 shadow-xl shadow-indigo-100/40 relative z-10">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 font-black text-xl text-white shadow-lg shadow-orange-500/20 mb-3">
            S
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            SMART <span className="text-orange-500">ABACUS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">Class Management System</p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-600 animate-fadeIn font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Login Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
         
          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartabacus.com"
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800/80 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-[10px] font-bold text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800/80 py-3 pl-11 pr-11 text-xs text-white placeholder-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20 transition-all font-mono"
              />
            
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 border border-orange-400/20"
          >
            <span>{loading ? "Authenticating Session..." : "Sign In to Dashboard"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Fast Demo Login Section */}
        <div className="mt-8 border-t border-slate-900 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-mono uppercase tracking-widest text-slate-400">
            <KeyRound className="h-4 w-4 text-orange-400" />
            <span>Quick Admin/Staff Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "System Admin", email: "admin@abacus.com" },
              { label: "Franchise Desk", email: "franchise@abacus.com" },
              { label: "Teacher Portal", email: "teacher@abacus.com" },
              { label: "Student Module", email: "student@abacus.com" }
            ].map((credential) => (
              <button
                key={credential.label}
                type="button"
                onClick={() => fillCredentials(credential.email)}
                className="rounded-xl bg-slate-900/40 border border-slate-800/60 px-3 py-2.5 text-left text-xs hover:bg-slate-900 hover:border-orange-500/30 transition-all text-slate-300 group"
              >
                <span className="font-bold text-slate-200 block group-hover:text-orange-400 transition-colors">{credential.label}</span>
                <span className="text-slate-500 text-[10px] truncate block mt-0.5">{credential.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}