"use client";

import React from "react";
import Link from "next/link";
import { useStudentData } from "./StudentContext";
// स्क्रीनशॉटमधील इंटरफेस मॅच करण्यासाठी मॉडर्न पेस्टेल-स्टाईल आयकॉन्स
import { 
  GraduationCap, BarChart3, Calendar, BookOpen, 
  ChevronRight, Award, CreditCard, Bell, User
} from "lucide-react";

export default function StudentDashboardOverview() {
  const { profile, assignments, submitAssignment } = useStudentData();

  const pendingAssignments = assignments.filter(a => a.status === "Pending");

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Card Banner (तंतोतंत स्क्रीनशॉटच्या लेआउटसारखे) */}
      <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/60 shadow-xs">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#1e293b] tracking-tight">
          Welcome Back, {profile.name}
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
          Here is a quick learning telemetry slice of your Smart Abacus student node for today.
        </p>
      </div>

      {/* 2. KPI Stats Grid (स्क्रीनशॉट प्रमाणे राइट-साईड आयकॉन बॉक्ससह) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "CURRENT LEVEL", 
            value: `Level ${profile.level}`, 
            subtitle: "Beginner Arithmetic", 
            icon: <GraduationCap className="w-5 h-5 text-[#4f46e5]" />, 
            iconBg: "bg-indigo-50" 
          },
          { 
            title: "LEARNING PROGRESS", 
            value: `${profile.progress}%`, 
            subtitle: `${profile.classesAttended}/${profile.totalClasses} Classes`, 
            icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, 
            iconBg: "bg-emerald-50" 
          },
          { 
            title: "CLASSES ATTENDED", 
            value: profile.classesAttended, 
            subtitle: "Next: Sat 10:00 AM", 
            icon: <Calendar className="w-5 h-5 text-amber-500" />, 
            iconBg: "bg-amber-50" 
          },
          { 
            title: "ASSIGNMENTS DUE", 
            value: pendingAssignments.length, 
            subtitle: `${profile.assignmentsDone} Completed`, 
            icon: <BookOpen className="w-5 h-5 text-rose-500" />, 
            iconBg: "bg-rose-50" 
          }
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 border border-slate-200/60 shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.title}</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</div>
              <span className="text-[10px] font-bold text-slate-400 block">{stat.subtitle}</span>
            </div>
            <div className={`w-10 h-10 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0 ml-2`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Split Row Panel - Operations & Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Quick Operations List (डावी बाजू - 5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-3 mb-4">
              QUICK OPERATIONS
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { href: "/dashboard/student/exams", title: "Exams & Tests", desc: "Check dates & reports", icon: <Award className="w-4 h-4 text-indigo-600" /> },
                { href: "/dashboard/student/attendance", title: "Class Attendance", desc: "Logs & Leave requests", icon: <Calendar className="w-4 h-4 text-emerald-600" /> },
                { href: "/dashboard/student/fees", title: "Tuition Fees", desc: "Pay due invoice fee", icon: <CreditCard className="w-4 h-4 text-amber-600" /> },
                { href: "/dashboard/student/notifications", title: "Announcements", desc: "Check notifications", icon: <Bell className="w-4 h-4 text-indigo-500" /> }
              ].map((link, idx) => (
                <Link key={idx} href={link.href} className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-2xs">
                      {link.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block group-hover:text-[#4f46e5] transition-colors">{link.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{link.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Task Queue Table (उजवी बाजू - 7 Columns - "TODAY'S HUB ACTIVITY QUEUE" स्टाईल) */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-5 border border-slate-200/60 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-3 mb-4">
            TODAY'S HUB TASK QUEUE
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="pb-2 font-bold tracking-wider">TASK TITLE</th>
                  <th className="pb-2 font-bold tracking-wider text-center">DUE DATE</th>
                  <th className="pb-2 font-bold tracking-wider text-center">POINTS</th>
                  <th className="pb-2 font-bold tracking-wider text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assign) => (
                  <tr key={assign.id} className="group hover:bg-slate-50/40 transition-all">
                    <td className="py-3 pr-2 font-bold text-[#4f46e5] group-hover:underline cursor-pointer">
                      {assign.title}
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Diff: {assign.difficulty}</div>
                    </td>
                    <td className="py-3 text-center text-slate-500 font-medium">{assign.dueDate}</td>
                    <td className="py-3 text-center text-slate-600 font-bold font-mono">{assign.points}</td>
                    <td className="py-3 text-right">
                      {assign.status === "Pending" ? (
                        <button
                          onClick={() => submitAssignment(assign.id)}
                          className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white transition-all font-bold text-[10px]"
                        >
                          Pending
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}