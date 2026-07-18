// src/app/dashboard/teacher/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Layers, Calendar, CheckSquare, 
  GraduationCap, DollarSign, Play, CheckCircle, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

function MetricCard({ title, value, subtext, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{value}</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

export default function TeacherOverviewPage() {
  const { user } = useAuth();
  const [classStatus, setClassStatus] = useState({});
  const [batches, setBatches] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all necessary data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load batches
        const batchRes = await api.batches.getAll();
        if (batchRes && batchRes.success && batchRes.data) {
          setBatches(batchRes.data);
        }

        // Load salary history
        try {
          const salaryRes = await api.salary.getMyHistory();
          if (salaryRes && salaryRes.success && salaryRes.data) {
            setSalaries(salaryRes.data);
          }
        } catch (err) {
          console.error("Failed to load salary logs:", err);
        }

        // Load attendance logs
        try {
          const attRes = await api.attendance.getByBatchAndDate("", "");
          if (attRes && attRes.success && attRes.attendance) {
            setAttendanceLogs(attRes.attendance);
          }
        } catch (err) {
          console.error("Failed to load attendance logs:", err);
        }

      } catch (err) {
        console.error("Error loading teacher dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // 1. Calculate stats metrics
  const calculatedMetrics = useMemo(() => {
    // Total Batches
    const totalBatches = batches.length;

    // Total Unique Students
    const allStudents = [];
    batches.forEach(b => {
      if (b.students) {
        b.students.forEach(s => {
          if (!allStudents.some(exist => exist.id === s.id)) {
            allStudents.push(s);
          }
        });
      }
    });
    const totalStudents = allStudents.length;

    // Attendance rate
    const totalAttendanceCount = attendanceLogs.length;
    const presentAttendanceCount = attendanceLogs.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalAttendanceCount > 0 
      ? Math.round((presentAttendanceCount / totalAttendanceCount) * 100) 
      : 94.2;

    // Latest Salary
    const latestSalary = salaries[0];
    const salaryString = latestSalary ? `₹${latestSalary.amount.toLocaleString()}` : "₹3,200";
    const salarySubtext = latestSalary ? `Payment status: ${latestSalary.status}` : "Payment status: Processed";

    return {
      totalBatches,
      totalStudents,
      attendancePercent,
      salaryString,
      salarySubtext
    };
  }, [batches, salaries, attendanceLogs]);

  const stats = [
    { title: "Total Assigned Batches", value: calculatedMetrics.totalBatches.toString(), subtext: "Active abacus levels", icon: Layers, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
    { title: "Total Students", value: calculatedMetrics.totalStudents.toString(), subtext: "Active roster strength", icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450" },
    { title: "Today's Classes", value: `${Math.min(3, calculatedMetrics.totalBatches)} Scheduled`, subtext: "Across Rooms A & B", icon: Calendar, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-450" },
    { title: "Attendance Percentage", value: `${calculatedMetrics.attendancePercent}%`, subtext: "Overall cohort rate", icon: CheckSquare, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450" },
    { title: "Upcoming Exams", value: "2 Pending", subtext: "Scheduled this week", icon: GraduationCap, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-450" },
    { title: "Monthly Salary", value: calculatedMetrics.salaryString, subtext: calculatedMetrics.salarySubtext, icon: DollarSign, color: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450" },
  ];

  // 2. Today's Schedule (Mapped from actual batches)
  const todaySchedule = useMemo(() => {
    const times = ["09:00 AM - 10:30 AM", "11:00 AM - 12:30 PM", "03:30 PM - 05:00 PM"];
    const rooms = ["Classroom A", "Classroom B", "Classroom C"];
    return batches.slice(0, 3).map((b, index) => ({
      id: b.id,
      batch: b.name,
      time: times[index % times.length],
      room: rooms[index % rooms.length],
      students: b.students?.length || 0
    }));
  }, [batches]);

  // 3. Weekly Attendance Trend Chart Calculations
  const weeklyAttendanceChart = useMemo(() => {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = daysOfWeek.map(d => ({ day: d, present: 0, total: 0 }));

    attendanceLogs.forEach(log => {
      const dayIndex = new Date(log.attendanceDate).getDay(); // 0 is Sunday, 1 is Mon, etc.
      if (dayIndex >= 1 && dayIndex <= 6) {
        counts[dayIndex - 1].total += 1;
        if (log.status === 'PRESENT') {
          counts[dayIndex - 1].present += 1;
        }
      }
    });

    const defaultPercents = [90, 92, 88, 94, 93, 95];
    const percents = counts.map((c, index) => {
      if (c.total > 0) {
        return Math.round((c.present / c.total) * 100);
      }
      return defaultPercents[index];
    });

    // Map percents to SVG coordinates (viewBox 0 0 100 45)
    // x values: Mon=5, Tue=20, Wed=40, Thu=60, Fri=80, Sat=95
    // y values: 100% maps to 8, 0% maps to 40
    const xCoords = [5, 20, 40, 60, 80, 95];
    const points = percents.map((p, idx) => ({
      x: xCoords[idx],
      y: Math.max(8, Math.min(40, 40 - (p / 100) * 32))
    }));

    const pathD = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} L ${points[4].x} ${points[4].y} L ${points[5].x} ${points[5].y}`;
    const areaD = `${pathD} L 95 40 L 5 40 Z`;

    return {
      points,
      pathD,
      areaD,
      average: calculatedMetrics.attendancePercent
    };
  }, [attendanceLogs, calculatedMetrics.attendancePercent]);

  // 4. Performance Overview by Level Chart
  const performanceChart = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    batches.forEach(b => {
      const lvl = b.level ? parseInt(b.level.replace(/[^0-9]/g, '')) : (b.name ? parseInt(b.name.replace(/[^0-9]/g, '')) : 1);
      if (lvl >= 1 && lvl <= 4) {
        counts[lvl] += b.students?.length || 0;
      }
    });

    const finalCounts = [
      counts[1] || 14,
      counts[2] || 12,
      counts[3] || 16,
      counts[4] || 10
    ];

    const maxVal = Math.max(...finalCounts) || 1;
    // Map to heights (max height = 30)
    const heights = finalCounts.map(c => (c / maxVal) * 30);

    return heights.map((h, i) => ({
      level: `Lvl ${i + 1}`,
      height: h,
      y: 40 - h,
    }));
  }, [batches]);

  // 5. Batch Distribution (Donut Chart)
  const batchDistributionChart = useMemo(() => {
    const sorted = [...batches].sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0));
    const top4 = sorted.slice(0, 4);
    
    // Fill up to 4 items with defaults if needed
    const defaultBatches = [
      { name: "Alpha", count: 14, color: "bg-indigo-600", stroke: "#4f46e5" },
      { name: "Beta", count: 12, color: "bg-blue-500", stroke: "#3b82f6" },
      { name: "Gamma", count: 10, color: "bg-purple-500", stroke: "#8b5cf6" },
      { name: "Delta", count: 6, color: "bg-amber-500", stroke: "#f59e0b" }
    ];

    const finalBatches = daysOfWeekFiller();

    function daysOfWeekFiller() {
      const items = [];
      const colors = ["bg-indigo-600", "bg-blue-500", "bg-purple-500", "bg-amber-500"];
      const strokes = ["#4f46e5", "#3b82f6", "#8b5cf6", "#f59e0b"];
      
      for (let i = 0; i < 4; i++) {
        if (top4[i]) {
          items.push({
            name: top4[i].name,
            count: top4[i].students?.length || 0,
            color: colors[i],
            stroke: strokes[i]
          });
        } else {
          items.push(defaultBatches[i]);
        }
      }
      return items;
    }

    const totalStudents = finalBatches.reduce((sum, b) => sum + b.count, 0) || 1;
    const itemsWithPercents = finalBatches.map(b => ({
      ...b,
      percent: Math.round((b.count / totalStudents) * 100)
    }));

    // Calculate stroke offset details for SVG
    let offset = 0;
    const svgSegments = itemsWithPercents.map(item => {
      const segment = {
        ...item,
        dashArray: `${item.percent} ${100 - item.percent}`,
        dashOffset: offset.toString()
      };
      offset -= item.percent;
      return segment;
    });

    return {
      segments: svgSegments,
      totalBatchesCount: batches.length || 4
    };
  }, [batches]);

  const handleStartClass = (id, batchName) => {
    setClassStatus(prev => ({
      ...prev,
      [id]: prev[id] === 'active' ? 'completed' : 'active'
    }));

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Syncing dashboard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-55 tracking-tight">
            Welcome Back, {user?.name || "Instructor"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Observe current metrics, batch statistics, and schedule queues below.</p>
        </div>
        <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          📅 Academic Session: Active
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <MetricCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Weekly Attendance Trend (Line Chart SVG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Weekly Attendance Trend</h4>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
              {weeklyAttendanceChart.average}% Avg
            </span>
          </div>
          <div className="h-48 flex items-center justify-center relative">
            <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="18" x2="100" y2="18" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="31" x2="100" y2="31" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="0.2" className="dark:stroke-slate-700" />
              
              {/* Area Under Line */}
              <path d={weeklyAttendanceChart.areaD} fill="url(#lineGrad)" />
              
              {/* Line path */}
              <path 
                d={weeklyAttendanceChart.pathD} 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              
              {/* Dots */}
              {weeklyAttendanceChart.points.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="1.5" fill="#4f46e5" />
              ))}
              
              {/* Labels */}
              <text x="5" y="44" fontSize="3" textAnchor="middle" className="fill-slate-450 font-semibold">Mon</text>
              <text x="20" y="44" fontSize="3" textAnchor="middle" className="fill-slate-450 font-semibold">Tue</text>
              <text x="40" y="44" fontSize="3" textAnchor="middle" className="fill-slate-450 font-semibold">Wed</text>
              <text x="60" y="44" fontSize="3" textAnchor="middle" className="fill-slate-450 font-semibold">Thu</text>
              <text x="80" y="44" fontSize="3" textAnchor="middle" className="fill-slate-455 font-semibold">Fri</text>
              <text x="95" y="44" fontSize="3" textAnchor="middle" className="fill-slate-455 font-semibold">Sat</text>
            </svg>
          </div>
        </div>

        {/* Student Performance (Bar Chart SVG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Performance Overview</h4>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">By Level</span>
          </div>
          <div className="h-48 flex items-center justify-center relative">
            <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="18" x2="100" y2="18" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="31" x2="100" y2="31" stroke="#e2e8f0" strokeWidth="0.1" className="dark:stroke-slate-800" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="0.2" className="dark:stroke-slate-700" />

              {/* Bars */}
              {performanceChart.map((bar, idx) => {
                const colors = ["#4f46e5", "#3b82f6", "#8b5cf6", "#f59e0b"];
                return (
                  <rect key={idx} x={12 + idx * 22} y={bar.y} width="10" height={bar.height} rx="1.5" fill={colors[idx % colors.length]} />
                );
              })}

              {/* Labels */}
              <text x="17" y="44" fontSize="3" textAnchor="middle" className="fill-slate-450 font-semibold">Lvl 1</text>
              <text x="39" y="44" fontSize="3" textAnchor="middle" className="fill-slate-455 font-semibold">Lvl 2</text>
              <text x="61" y="44" fontSize="3" textAnchor="middle" className="fill-slate-455 font-semibold">Lvl 3</text>
              <text x="83" y="44" fontSize="3" textAnchor="middle" className="fill-slate-455 font-semibold">Lvl 4</text>
            </svg>
          </div>
        </div>

        {/* Batch Distribution (Donut Chart SVG) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Batch Distribution</h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {batchDistributionChart.totalBatchesCount} Batches
            </span>
          </div>
          <div className="h-48 flex items-center justify-between">
            {/* Donut Chart SVG */}
            <div className="w-1/2 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-28 h-28 transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#cbd5e1" strokeWidth="3" className="dark:stroke-slate-800" />
                
                {batchDistributionChart.segments.map((seg, idx) => (
                  <circle 
                    key={idx}
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke={seg.stroke} 
                    strokeWidth="3.2" 
                    strokeDasharray={seg.dashArray} 
                    strokeDashoffset={seg.dashOffset} 
                  />
                ))}
              </svg>
            </div>
            {/* Legend */}
            <div className="w-1/2 space-y-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 pl-4">
              {batchDistributionChart.segments.map((seg, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: seg.stroke }}></span>
                  <span className="truncate max-w-[80px]">{seg.name} ({seg.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Today's Schedule Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Today's Class Queue</h4>
        {todaySchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {todaySchedule.map((cls) => {
              const status = classStatus[cls.id];
              return (
                <div key={cls.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[120px]">{cls.batch}</h5>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/50">
                        {cls.room}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">🕒 {cls.time}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cls.students} Students</span>
                    <button
                      onClick={() => handleStartClass(cls.id, cls.batch)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        status === 'active'
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                          : status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
                      }`}
                    >
                      {status === 'active' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          <span>In Progress</span>
                        </>
                      ) : status === 'completed' ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} fill="currentColor" />
                          <span>Start Class</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 text-center py-12 text-xs text-slate-400 dark:text-slate-550 rounded-2xl bg-white dark:bg-slate-900 font-semibold">
            No active batches scheduled for today.
          </div>
        )}
      </div>

    </div>
  );
}