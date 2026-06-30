"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#eceffd] px-4 overflow-hidden font-sans antialiased">
      
      {/* Background Radial Ambient Gradients like Teacher Console */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-200/60 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/50 blur-[130px] pointer-events-none z-0"></div>

      {/* Main Glassmorphism Container Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-8 shadow-xl shadow-indigo-100/40 relative z-10">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">
              SMART <span className="text-indigo-600">ABACUS</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Class Management System</p>
          
          <div className="mt-6 text-center">
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-indigo-100/60">
              Security Portal
            </span>
            <h2 className="text-lg font-black text-slate-800 mt-3 tracking-tight">Reset Password</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your new password below</p>
          </div>
        </div>

        {/* Input Fields Form */}
        <form className="space-y-4">
          
          {/* New Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="password" 
                required
                placeholder="Enter new password"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
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
                type="password" 
                required
                placeholder="Confirm your password"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 active:scale-[0.99] transition-all mt-6 cursor-pointer"
          >
            Update Password <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Navigation Link Back to Login */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-medium">
            Remember your password?{" "}
            <Link href="/pages/auth/login" className="text-indigo-600 font-bold hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}