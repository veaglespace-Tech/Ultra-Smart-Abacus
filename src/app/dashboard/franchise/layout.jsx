"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, GraduationCap, Users, Calendar, 
  CheckSquare, CreditCard, Box, BarChart3, Menu, X, LogOut 
} from "lucide-react";

export default function FranchiseLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarItems = [
    { name: 'Overview', href: '/dashboard/franchise', icon: LayoutDashboard },
    { name: 'Students', href: '/dashboard/franchise/students', icon: GraduationCap },
    { name: 'Teachers', href: '/dashboard/franchise/teachers', icon: Users },
    { name: 'Batches', href: '/dashboard/franchise/batches', icon: Calendar },
    { name: 'Attendance', href: '/dashboard/franchise/attendance', icon: CheckSquare },
    { name: 'Fees', href: '/dashboard/franchise/fees', icon: CreditCard },
    { name: 'Inventory', href: '/dashboard/franchise/inventory', icon: Box },
    { name: 'Payments', href: '/dashboard/franchise/payments', icon: CreditCard },
    { name: 'Reports', href: '/dashboard/franchise/reports', icon: BarChart3 },
  ];

  const handleSignOut = () => {
    router.push('/login'); 
  };

  const currentActiveItem = sidebarItems.find(item => item.href === pathname);
  const pageTitle = currentActiveItem ? currentActiveItem.name : "Center Metrics";

  return (
    <div className="flex h-screen bg-[#eceffd] text-slate-800 font-sans overflow-hidden w-full relative">
      
      {/* Background Radial Ambient Gradients like Teacher Console */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/50 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-purple-200/40 blur-[120px] pointer-events-none z-0"></div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
        />
      )}
      
      {/* Modern Glass Console Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/70 backdrop-blur-md border-r border-slate-200 flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 md:static md:flex shrink-0 m-0 md:m-4 md:mr-0 md:rounded-3xl shadow-sm ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Header Branding */}
          <div className="mb-8 px-2 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                <h1 className="text-sm font-black tracking-wider text-slate-900 uppercase font-sans">
                  SMART ABACUS
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 ml-4 uppercase">FRANCHISE CONSOLE</p>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-900 p-1 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links with Active States like Teacher UI */}
          <nav className="space-y-1 text-xs font-bold">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen ? setIsMobileOpen(false) : null} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 translate-x-1"
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <IconComponent size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Profile */}
        <div className="border-t border-slate-100 pt-4 mt-4">
          <div className="flex items-center gap-3 p-2 bg-slate-50/80 rounded-xl mb-2 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0">
              MW
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-slate-800 truncate">Mumbai West Center</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Franchise Owner</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut} 
            className="w-full text-left text-xs text-red-500 hover:text-red-600 font-bold px-3 py-2 transition-colors flex items-center gap-2 rounded-lg hover:bg-red-50 cursor-pointer"
          >
            <LogOut size={14} /> <span>Exit Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-white/80 border border-slate-200 md:hidden text-slate-700 cursor-pointer shadow-sm"
            >
              <Menu size={16} />
            </button>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider font-mono">
              WORKSPACE / <span className="text-indigo-600 uppercase font-sans font-black">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] md:text-xs">
            <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </header>

        {/* Main Content Card Container */}
        <main className="p-4 md:p-6 pt-0 flex-1 overflow-y-auto w-full">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}