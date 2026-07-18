"use client";

import React, { useState } from "react";
import { useStudentData } from "../StudentContext";

export default function StudentProgressPage() {
  const { profile } = useStudentData();

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const performanceData = [
    {
      month: "Jan",
      score: 62,
      accuracy: "60%",
      speed: "Average",
      improvement: "+4%",
    },
    {
      month: "Feb",
      score: 68,
      accuracy: "65%",
      speed: "Average",
      improvement: "+6%",
    },
    {
      month: "Mar",
      score: 74,
      accuracy: "71%",
      speed: "Good",
      improvement: "+8%",
    },
    {
      month: "Apr",
      score: 81,
      accuracy: "78%",
      speed: "Good",
      improvement: "+7%",
    },
    {
      month: "May",
      score: 86,
      accuracy: "84%",
      speed: "Very Good",
      improvement: "+5%",
    },
    {
      month: "Jun",
      score: 92,
      accuracy: "90%",
      speed: "Excellent",
      improvement: "+6%",
    },
  ];

  const skillMetrics = [
    {
      metric: "Bead Movement Accuracy",
      pct: "92%",
      value: 92,
      color: "from-blue-500 to-indigo-600",
      description:
        "Student demonstrates strong accuracy while performing bead movement calculations.",
      recommendation:
        "Continue regular practice to maintain speed and accuracy.",
    },
    {
      metric: "Oral Sum Speed (Single Digits)",
      pct: "85%",
      value: 85,
      color: "from-emerald-500 to-teal-600",
      description:
        "Good performance in solving single-digit oral arithmetic problems.",
      recommendation:
        "Practice timed oral sums to further improve calculation speed.",
    },
    {
      metric: "Visual Sum Speed (Double Digits)",
      pct: "64%",
      value: 64,
      color: "from-amber-500 to-orange-600",
      description:
        "Student is developing confidence in visual double-digit calculations.",
      recommendation:
        "Additional daily visual practice is recommended.",
    },
    {
      metric: "Workbook Completion Pace",
      pct: "78%",
      value: 78,
      color: "from-pink-500 to-rose-600",
      description:
        "Most assigned workbook activities are being completed on schedule.",
      recommendation:
        "Maintain a consistent practice routine.",
    },
  ];

  const examResults = [
    {
      exam: "Level 1 Assessment",
      date: "15 June 2026",
      score: "86%",
      totalMarks: 100,
      obtainedMarks: 86,
      correctAnswers: 43,
      totalQuestions: 50,
      accuracy: "86%",
      status: "Excellent",
      remark: "Very good understanding of the concepts covered in Level 1.",
    },
    {
      exam: "Speed Arithmetic Test",
      date: "10 June 2026",
      score: "92%",
      totalMarks: 100,
      obtainedMarks: 92,
      correctAnswers: 46,
      totalQuestions: 50,
      accuracy: "92%",
      status: "Excellent",
      remark: "Excellent speed and accuracy. Keep up the consistent practice.",
    },
    {
      exam: "Visual Calculation Test",
      date: "02 June 2026",
      score: "78%",
      totalMarks: 100,
      obtainedMarks: 78,
      correctAnswers: 39,
      totalQuestions: 50,
      accuracy: "78%",
      status: "Good",
      remark:
        "Good progress. More visual calculation practice can improve performance.",
    },
  ];

  const closeModal = () => {
    setSelectedExam(null);
    setSelectedMonth(null);
    setSelectedSkill(null);
    setShowFeedback(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">
            Student Progress & Learning Metrics
          </h3>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Track performance, scores, learning progress and teacher feedback.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Level Completion: {profile.progress}%
        </div>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Current Level
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Level {profile.level}
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Current learning stage
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Overall Score
          </p>

          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            86%
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Based on recent assessments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Classes Completed
          </p>

          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {profile.classesAttended}/{profile.totalClasses}
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Learning sessions completed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Performance Status
          </p>

          <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            Excellent
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Consistent learning progress
          </p>
        </div>

      </div>

      {/* Performance Trend */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Performance Progress Trend
            </h4>

            <p className="text-[10px] text-slate-500 mt-1">
              Click any month to view detailed performance.
            </p>
          </div>

          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            Monthly View
          </span>
        </div>

        <div className="flex items-end justify-between gap-3 h-48">

          {performanceData.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedMonth(item)}
              className="flex-1 flex flex-col items-center justify-end gap-2 group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {item.score}%
              </span>

              <div className="w-full max-w-[55px] h-36 bg-slate-100 dark:bg-slate-950 rounded-t-xl flex items-end overflow-hidden group-hover:ring-2 group-hover:ring-indigo-300 transition-all">

                <div
                  style={{ height: `${item.score}%` }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t-xl transition-all duration-700 group-hover:from-indigo-700 group-hover:to-blue-500"
                />

              </div>

              <span className="text-[10px] font-medium text-slate-500 group-hover:text-indigo-600">
                {item.month}
              </span>
            </button>
          ))}

        </div>
      </div>

      {/* Skill Performance Metrics */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Skill Performance Metrics
          </h4>

          <p className="text-[10px] text-slate-500 mt-1">
            Click any skill to view detailed performance information.
          </p>
        </div>

        <div className="space-y-4">

          {skillMetrics.map((bar, i) => (
            <button
              key={i}
              onClick={() => setSelectedSkill(bar)}
              className="w-full text-left flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 group cursor-pointer"
            >
              <span className="w-52 text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {bar.metric}
              </span>

              <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">

                <div
                  style={{ width: bar.pct }}
                  className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-1000`}
                />

              </div>

              <span className="w-12 text-right text-xs font-mono font-bold text-slate-800 dark:text-white">
                {bar.pct}
              </span>
            </button>
          ))}

        </div>
      </div>

      {/* Exam Results */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">

          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
            Assessment & Exam Results
          </h4>

          <p className="text-[10px] text-slate-500 mt-1">
            Click any assessment to view complete result details.
          </p>

        </div>

        <div className="space-y-3">

          {examResults.map((exam, index) => (
            <button
              key={index}
              onClick={() => setSelectedExam(exam)}
              className="w-full text-left flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-all"
            >

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {exam.exam}
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  {exam.date}
                </p>
              </div>

              <div className="flex items-center gap-4">

                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {exam.score}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {exam.status}
                </span>

                <span className="text-slate-400">
                  →
                </span>

              </div>

            </button>
          ))}

        </div>
      </div>

      {/* Teacher Feedback */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Teacher Feedback
            </h4>

            <p className="text-[10px] text-slate-500 mt-1">
              Feedback and learning guidance from your teacher.
            </p>
          </div>

          <span className="text-xl">💬</span>

        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">

          <p className="text-xs leading-6 text-slate-700 dark:text-slate-300">
            Excellent progress in bead movement and oral calculation speed.
            Continue practicing visual sums regularly to improve calculation
            speed and accuracy.
          </p>

          <div className="flex items-center justify-between mt-4">

            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              — Teacher Feedback
            </p>

            <button
              onClick={() => setShowFeedback(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-colors"
            >
              View Full Feedback
            </button>

          </div>

        </div>

      </div>

      {/* Modal */}
      {(selectedExam || selectedMonth || selectedSkill || showFeedback) && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          onClick={closeModal}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
          >

            {/* Exam Details */}
            {selectedExam && (

              <div>

                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assessment Details
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedExam.exam}
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-5 space-y-5">

                  <div className="grid grid-cols-2 gap-3">

                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                      <p className="text-[10px] text-slate-500">
                        Score
                      </p>

                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {selectedExam.score}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                      <p className="text-[10px] text-slate-500">
                        Accuracy
                      </p>

                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {selectedExam.accuracy}
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      <p className="text-[10px] text-slate-500">
                        Total Marks
                      </p>

                      <p className="font-bold text-slate-800 dark:text-white mt-1">
                        {selectedExam.totalMarks}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      <p className="text-[10px] text-slate-500">
                        Obtained Marks
                      </p>

                      <p className="font-bold text-slate-800 dark:text-white mt-1">
                        {selectedExam.obtainedMarks}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      <p className="text-[10px] text-slate-500">
                        Correct Answers
                      </p>

                      <p className="font-bold text-slate-800 dark:text-white mt-1">
                        {selectedExam.correctAnswers}/{selectedExam.totalQuestions}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      <p className="text-[10px] text-slate-500">
                        Exam Date
                      </p>

                      <p className="font-bold text-slate-800 dark:text-white mt-1">
                        {selectedExam.date}
                      </p>
                    </div>

                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">

                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1">
                      Teacher Remark
                    </p>

                    <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                      {selectedExam.remark}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* Month Details */}
            {selectedMonth && (

              <div>

                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Monthly Performance
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedMonth.month} 2026
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-5 space-y-4">

                  <div className="text-center p-5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">

                    <p className="text-[10px] text-slate-500">
                      Overall Performance Score
                    </p>

                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                      {selectedMonth.score}%
                    </p>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      <p className="text-[10px] text-slate-500">
                        Accuracy
                      </p>

                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                        {selectedMonth.accuracy}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      <p className="text-[10px] text-slate-500">
                        Calculation Speed
                      </p>

                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                        {selectedMonth.speed}
                      </p>
                    </div>

                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">

                    <p className="text-[10px] text-slate-500">
                      Improvement
                    </p>

                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {selectedMonth.improvement}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* Skill Details */}
            {selectedSkill && (

              <div>

                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Skill Performance Details
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedSkill.metric}
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-5 space-y-4">

                  <div className="text-center p-5 rounded-xl bg-slate-50 dark:bg-slate-950/50">

                    <p className="text-[10px] text-slate-500">
                      Current Performance
                    </p>

                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                      {selectedSkill.pct}
                    </p>

                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">

                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                      Performance Summary
                    </p>

                    <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                      {selectedSkill.description}
                    </p>

                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10">

                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1">
                      Recommended Focus
                    </p>

                    <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                      {selectedSkill.recommendation}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* Full Teacher Feedback */}
            {showFeedback && (

              <div>

                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Teacher Feedback
                    </h3>

                    <p className="text-[10px] text-slate-500 mt-1">
                      Detailed learning feedback
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-5">

                  <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">

                    <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                      Excellent progress in bead movement and oral calculation
                      speed. The student is showing consistent improvement in
                      accuracy and confidence. Continue practicing visual sums
                      regularly to improve calculation speed and accuracy.
                    </p>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                      <p className="text-[10px] text-slate-500">
                        Strength
                      </p>

                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        Oral Calculation
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                      <p className="text-[10px] text-slate-500">
                        Focus Area
                      </p>

                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1">
                        Visual Sums
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}