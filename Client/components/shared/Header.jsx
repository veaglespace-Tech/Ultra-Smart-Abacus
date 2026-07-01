import React from "react";
import Link from "next/link";
import { BookOpen, Calendar } from "lucide-react"; // आयकॉन्ससाठी

const Header = () => {
  return (
    <header className="w-full relative z-50 bg-[#070b13]/60 backdrop-blur-md border-b border-slate-800/40 px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
      
    
      <div className="flex flex-col text-center md:text-left">
        <Link href="/">
          <h1 className="text-2xl font-black tracking-wider text-blue-500 cursor-pointer">
            SMART <span className="text-orange-500">ABACUS</span>
          </h1>
        </Link>
        <p className="text-[10px] tracking-widest text-slate-400 uppercase font-mono mt-0.5">
          Indias leading abacus mental arithmetic institute
        </p>
      </div>

      
      <div className="hidden lg:flex items-center space-x-6 text-xs font-medium text-slate-300 bg-slate-950/40 border border-slate-800/50 px-5 py-2 rounded-full backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          <span>Improve Concentration & Memory</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
          <span>Enhance Cognitive Abilities</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Boost Confidence</span>
        </div>
</div>
      <div className="flex items-center gap-3">
        {/* Explore Courses Button */}
        <Link href="/courses">
          <button className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold rounded-xl transition-all active:scale-[0.97]">
            <BookOpen size={14} className="text-orange-400" />
            <span>Explore Courses</span>
          </button>
        </Link>

        {/* Book Free Demo Class Button */}
        <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 text-white text-xs font-extrabold rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-orange-600/20 border border-orange-400/20">
          <Calendar size={14} />
          <span>Book Free Demo Class</span>
        </button>
      </div>

    </header>
  );
};

export default Header;