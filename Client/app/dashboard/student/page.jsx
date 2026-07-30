"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStudentData } from "./StudentContext";
import { 
  GraduationCap, BarChart3, Calendar, BookOpen, 
  ChevronRight, Award, CreditCard, Bell, Loader2, Sparkles,
  ArrowUpRight, CheckCircle2, Clock
} from "lucide-react";

function MetricCard({ title, value, subtext, icon: Icon, color, trend }) {
  return (
    <div className="bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] card-hover hover:translate-y-[-6px] hover:shadow-[0_20px_40px_rgba(45,27,105,0.12)] hover:border-orange-500/35 transition-all duration-300 flex justify-between items-start relative overflow-hidden group">
      <div className="space-y-2 relative z-10">
        <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-black tracking-widest">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-[#2D1B69] dark:text-white tracking-tight">{value}</h3>
          {trend && (
            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold">{subtext}</p>
      </div>
      <div className={`p-3 rounded-xl ${color} relative z-10 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={18} />
      </div>
      <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
    </div>
  );
}

export default function StudentDashboardOverview() {
  const { profile, assignments, submitAssignment } = useStudentData();

  const pendingAssignments = useMemo(() => {
    return assignments.filter(a => a.status === "Pending");
  }, [assignments]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // If profile data is not loaded yet
  if (!profile || !profile.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-accent" size={32} />
        <p className="text-xs text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Syncing student telemetry...</p>
      </div>
    );
  }

  const displayName = profile.name
    ? profile.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Student";

  const stats = [
    {
      title: "Current Level",
      value: `Level ${profile.level || 1}`,
      subtext: "Beginner Arithmetic",
      icon: GraduationCap,
      color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-cream",
      trend: null
    },
    {
      title: "Learning Progress",
      value: `${profile.progress || 0}%`,
      subtext: `${profile.classesAttended || 0}/${profile.totalClasses || 0} Classes`,
      icon: BarChart3,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      trend: null
    },
    {
      title: "Classes Attended",
      value: (profile.classesAttended || 0).toString(),
      subtext: "Next class: Sat 10:00 AM",
      icon: Calendar,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      trend: null
    },
    {
      title: "Assignments Due",
      value: pendingAssignments.length.toString(),
      subtext: `${profile.assignmentsDone || 0} Completed`,
      icon: BookOpen,
      color: "bg-rose-50 text-rose-650 dark:bg-rose-950/40 dark:text-rose-450",
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {getGreeting()}, <span className="gradient-text">{displayName}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">Observe your learning metrics, assignments, and schedule queues below.</p>
        </div>
        <div className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-xl border border-orange-250 dark:border-orange-900/40">
          🎓 Academic Status: Level {profile.level || 1}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <MetricCard key={idx} {...stat} />
        ))}
      </div>

      {/* Split Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Quick Operations List (5 columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h4 className="text-xs font-black uppercase text-slate-550 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-500" />
                <span>Quick Operations</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { href: "/dashboard/student/exams", title: "Exams & Tests", desc: "Check dates & reports", icon: Award, color: "text-[#2D1B69] bg-primary/10" },
                { href: "/dashboard/student/attendance", title: "Class Attendance", desc: "Logs & Leave requests", icon: Calendar, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
                { href: "/dashboard/student/fees", title: "Tuition Fees", desc: "Pay due invoice fee", icon: CreditCard, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
                { href: "/dashboard/student/notifications", title: "Announcements", desc: "Check notifications", icon: Bell, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40" }
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={idx} 
                    href={link.href} 
                    className="p-3 rounded-2xl bg-slate-50/50 dark:bg-[#150e2a]/55 border border-slate-150/60 dark:border-slate-800 hover:bg-[#FFF8F0]/30 dark:hover:bg-[#1e1445]/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${link.color} flex items-center justify-center shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                          {link.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {link.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Queue Table (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1e1445] border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-[0_2px_20px_rgba(45,27,105,0.06)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <h4 className="text-xs font-black uppercase text-slate-550 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-orange-500" />
              <span>Today's Hub Task Queue</span>
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending assignments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3.5 font-bold tracking-wider">Task Title</th>
                  <th className="pb-3.5 font-bold tracking-wider text-center">Due Date</th>
                  <th className="pb-3.5 font-bold tracking-wider text-center">Points</th>
                  <th className="pb-3.5 font-bold tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments && assignments.length > 0 ? (
                  assignments.map((assign) => (
                    <tr key={assign.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-orange-500 transition-colors">{assign.title}</span>
                        <div className="text-[10px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">Diff: {assign.difficulty}</div>
                      </td>
                      <td className="py-3.5 text-center text-slate-500 dark:text-slate-400 font-mono">{assign.dueDate}</td>
                      <td className="py-3.5 text-center text-slate-700 dark:text-slate-300 font-black font-mono">{assign.points}</td>
                      <td className="py-3.5 text-right">
                        {assign.status === "Pending" ? (
                          <button
                            onClick={() => submitAssignment(assign.id)}
                            className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-gradient-to-r hover:from-[#2D1B69] hover:to-[#FF6B2B] hover:text-white hover:border-transparent transition-all font-bold text-[10px] cursor-pointer"
                          >
                            Submit
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/30 inline-flex items-center gap-1">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                      No assignments assigned today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}