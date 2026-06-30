"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, BookOpen, UserCheck, 
  CreditCard, Award, Box, LogOut, CheckSquare, BarChart3
} from "lucide-react";

export const Sidebar = ({ role }) => {
  const pathname = usePathname();

  // 📝 
  const menuConfig = {
    admin: [
      { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Franchises", href: "/modules/franchises", icon: Users },
      { name: "Global Inventory", href: "/modules/inventory", icon: Box },
    ],
    franchise: [
      { name: "Overview", href: "/dashboard/franchise", icon: LayoutDashboard },
      { name: "Students", href: "/modules/students", icon: Users },
      { name: "Teachers", href: "/modules/teachers", icon: UserCheck },
      { name: "Batches", href: "/modules/batches", icon: BookOpen },
      { name: "Attendance", href: "/modules/attendance", icon: CheckSquare },
      { name: "Fees", href: "/dashboard/franchise/fees", icon: CreditCard }, //
      { name: "Inventory", href: "/modules/inventory", icon: Box },
      { name: "Payments", href: "/modules/payments", icon: CreditCard },
      { name: "Reports", href: "/modules/reports", icon: BarChart3 },
    ],
    teacher: [
      { name: "My Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
      { name: "Attendance", href: "/modules/attendance", icon: UserCheck },
      { name: "Exams", href: "/modules/exams", icon: Award },
      { name: "Progress Board", href: "/modules/progress", icon: Box },
    ],
    student: [
      { name: "My Progress", href: "/dashboard/student", icon: LayoutDashboard },
      { name: "Attendance View", href: "/modules/attendance", icon: UserCheck },
      { name: "Exam Section", href: "/modules/exams", icon: Award },
      { name: "Fee Status", href: "/modules/fees", icon: CreditCard },
    ],
  };

  const activeMenus = menuConfig[role] || [];

  return (
    <aside className="w-64 h-screen bg-[#040b19] border-r border-slate-900 flex flex-col justify-between p-4 font-sans select-none">
      
      {/* 🚀 Top Brand Logo Section */}
      <div className="space-y-5">
        <div className="px-3 py-1.5 border-b border-gray-950 pb-4">
          <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-2 uppercase">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 w-2.5 h-4 rounded-sm block"></span>
            Smart Abacus
          </h2>
          <p className="text-[9px] font-black text-amber-500 tracking-widest uppercase mt-0.5 font-mono pl-4.5">
            {role} Portal
          </p>
        </div>
        
        {/* 📋 Navigation Links */}
        <nav className="space-y-1">
          {activeMenus.map((item, idx) => {
            const Icon = item.icon;
            // Next.js 
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link key={idx} href={item.href} className="block">
                <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative group ${
                  isActive 
                    ? "bg-gradient-to-r from-[#0d1c38] to-[#081326] text-orange-400 border border-orange-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}>
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 w-1 h-1/2 bg-orange-500 rounded-r-md"></span>
                  )}
                  
                  <Icon size={16} className={isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 👤 Bottom Footer: Profile Card & Logout */}
      <div className="space-y-3 border-t border-gray-950 pt-4 mt-auto">
        
        {/* स्क्रीनशॉटमधील 'Mumbai West Center' */}
        <div className="flex items-center gap-3 p-2.5 bg-[#071022]/60 border border-gray-950 rounded-2xl shadow-inner">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-600 to-amber-500 rounded-xl flex items-center justify-center font-black text-xs text-white uppercase shadow-md shrink-0">
            {role === 'franchise' ? 'FO' : role.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-black text-white tracking-tight truncate">
              {role === 'franchise' ? 'Mumbai West Center' : `${role.charAt(0).toUpperCase() + role.slice(1)} Control`}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5 capitalize">
              {role === 'franchise' ? 'Franchise Owner' : `${role} Account`}
            </p>
          </div>
        </div>

        <button className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-950/20 transition-all text-left w-full cursor-pointer group">
          <LogOut size={16} className="text-red-400/80 group-hover:translate-x-0.5 transition-transform" />
          <span>Logout Session</span>
        </button>
      </div>

    </aside>
  );
};