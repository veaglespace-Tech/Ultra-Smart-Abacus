"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentPageRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/dashboard/student");
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#eceffd] px-4 overflow-hidden font-sans antialiased">
      
      {/* Background Radial Ambient Gradients like Teacher Console */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-200/60 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/50 blur-[130px] pointer-events-none z-0"></div>

      {/* Main Glassmorphism Container Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-8 text-center shadow-xl shadow-indigo-100/40 relative z-10">
        
        {/* Animated Loading Ring */}
        <div className="flex justify-center mb-5">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        </div>

        <h1 className="text-base font-black text-slate-800 tracking-tight mb-2">
          Redirecting to Student Dashboard...
        </h1>
        
        <p className="text-xs text-slate-400 font-medium">
          Please wait while we set up your secure learning terminal session.
        </p>

      </div>
    </div>
  );
}