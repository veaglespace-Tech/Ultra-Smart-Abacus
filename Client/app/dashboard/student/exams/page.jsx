"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  Award,
  Eye,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText,
  Target,
} from "lucide-react";
import { useStudentData } from "../StudentContext";

export default function StudentExamsPage() {
  const { exams } = useStudentData();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedExam, setSelectedExam] = useState(null);
  const [modalType, setModalType] = useState(null);

  const normalizedExams = useMemo(() => {
    return (exams || []).map((exam) => {
      const numericScore =
        typeof exam.score === "number"
          ? exam.score
          : exam.score
          ? Number(String(exam.score).replace("%", ""))
          : null;

      const maxMarks = Number(exam.maxMarks || 100);

      const percentage =
        numericScore !== null
          ? Math.round((numericScore / maxMarks) * 100)
          : null;

      const resultStatus =
        exam.status === "Passed" ||
        exam.status === "Failed" ||
        exam.status === "Completed" ||
        numericScore !== null
          ? "Completed"
          : "Upcoming";

      return {
        ...exam,
        scoreValue: numericScore,
        maxMarks,
        percentage,
        resultStatus,
      };
    });
  }, [exams]);

  const completedExams = normalizedExams.filter(
    (exam) =>
      exam.resultStatus === "Completed" &&
      exam.percentage !== null
  );

  const averageScore =
    completedExams.length > 0
      ? (
          completedExams.reduce(
            (total, exam) => total + exam.percentage,
            0
          ) / completedExams.length
        ).toFixed(1)
      : "—";

  const filteredExams = useMemo(() => {
    return normalizedExams.filter((exam) => {
      const searchMatch =
        exam.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exam.id
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const filterMatch =
        activeFilter === "All" ||
        (activeFilter === "Upcoming" &&
          exam.resultStatus === "Upcoming") ||
        (activeFilter === "Completed" &&
          exam.resultStatus === "Completed");

      return searchMatch && filterMatch;
    });
  }, [normalizedExams, searchTerm, activeFilter]);

  const getGrade = (percentage) => {
    if (percentage === null) return "—";
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "Needs Improvement";
  };

  const getStatusStyle = (exam) => {
    if (exam.resultStatus === "Upcoming") {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    }

    if (exam.status === "Passed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    }

    if (exam.status === "Failed") {
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    }

    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  };

  const openModal = (exam, type) => {
    setSelectedExam(exam);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedExam(null);
    setModalType(null);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">ACADEMIC EXAMINATION SCHEDULE & GRADES</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">View upcoming examinations, assessment schedules, results and performance feedback.</p>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 self-start sm:self-center">
          <Award size={14} />
          Avg. Score: {averageScore}%
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Total Exams
            </p>
            <FileText size={18} className="text-indigo-500" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {normalizedExams.length}
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            All assessments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Upcoming
            </p>
            <Calendar size={18} className="text-amber-500" />
          </div>

          <h2 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-3">
            {
              normalizedExams.filter(
                (exam) => exam.resultStatus === "Upcoming"
              ).length
            }
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Scheduled assessments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Completed
            </p>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>

          <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3">
            {completedExams.length}
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Results available
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Average Score
            </p>
            <Target size={18} className="text-blue-500" />
          </div>

          <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-3">
            {averageScore}%
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Based on completed exams
          </p>
        </div>

      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3">

        <div className="relative flex-1">

          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search examination..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-9 pr-4 text-xs font-semibold outline-none focus:border-indigo-500"
          />

        </div>

        <div className="flex gap-2">

          {["All", "Upcoming", "Completed"].map((filter) => (

            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                activeFilter === filter
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
              }`}
            >
              {filter}
            </button>

          ))}

        </div>

      </div>

      {/* EXAMS TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs border-collapse">

            <thead>

              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] font-bold">

                <th className="px-6 py-4">
                  Assessment Name
                </th>

                <th className="px-6 py-4">
                  Date
                </th>

                <th className="px-6 py-4">
                  Session Time
                </th>

                <th className="px-6 py-4 text-center">
                  Duration
                </th>

                <th className="px-6 py-4 text-center">
                  Grade / Score
                </th>

                <th className="px-6 py-4 text-center">
                  Status
                </th>

                <th className="px-6 py-4 text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">

              {filteredExams.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="py-14 text-center"
                  >

                    <BookOpen
                      size={30}
                      className="mx-auto text-slate-300 dark:text-slate-700"
                    />

                    <p className="text-xs font-bold text-slate-500 mt-3">
                      No examinations found
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Try changing your search or filter.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredExams.map((exam) => (

                  <tr
                    key={exam.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >

                    <td className="px-6 py-4">

                      <button
                        onClick={() =>
                          openModal(exam, "details")
                        }
                        className="text-left group"
                      >

                        <span className="font-bold text-slate-900 dark:text-slate-50 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {exam.name}
                        </span>

                        <span className="text-[9px] text-slate-500 font-mono">
                          {exam.id || "Assessment"}
                        </span>

                      </button>

                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">

                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {exam.date || "N/A"}
                      </div>

                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">

                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {exam.time || "N/A"}
                      </div>

                    </td>

                    <td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-400">
                      {exam.duration || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-center">

                      {exam.percentage !== null ? (

                        <div>

                          <p className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                            {exam.scoreValue}/{exam.maxMarks}
                          </p>

                          <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                            {getGrade(exam.percentage)}
                          </p>

                        </div>

                      ) : (

                        <span className="text-slate-400 font-bold">
                          —
                        </span>

                      )}

                    </td>

                    <td className="px-6 py-4 text-center">

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(
                          exam
                        )}`}
                      >
                        {exam.status || "Scheduled"}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          openModal(
                            exam,
                            exam.resultStatus === "Completed"
                              ? "result"
                              : "details"
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                      >

                        <Eye size={12} />

                        {exam.resultStatus === "Completed"
                          ? "View Result"
                          : "View Details"}

                        <ChevronRight size={12} />

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* DETAILS / RESULT MODAL */}

      {(modalType === "details" ||
        modalType === "result") &&
        selectedExam && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >

            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >

              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">

                <div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {modalType === "result"
                      ? "Examination Result"
                      : "Examination Details"}
                  </h3>

                  <p className="text-[10px] text-slate-500 mt-1">
                    {selectedExam.name}
                  </p>

                </div>

                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
                >
                  <X size={15} />
                </button>

              </div>

              <div className="p-5 space-y-5">

                <div className="grid grid-cols-2 gap-3">

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[10px] text-slate-500">
                      Date
                    </p>

                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                      {selectedExam.date || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[10px] text-slate-500">
                      Time
                    </p>

                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                      {selectedExam.time || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[10px] text-slate-500">
                      Duration
                    </p>

                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                      {selectedExam.duration || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[10px] text-slate-500">
                      Status
                    </p>

                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                      {selectedExam.status || "Scheduled"}
                    </p>
                  </div>

                </div>

                {modalType === "result" &&
                selectedExam.percentage !== null ? (

                  <>

                    <div className="text-center p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">

                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Final Score
                      </p>

                      <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                        {selectedExam.percentage}%
                      </p>

                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
                        {selectedExam.scoreValue} / {selectedExam.maxMarks}
                      </p>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">

                        <p className="text-[10px] text-slate-500">
                          Grade
                        </p>

                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          {getGrade(selectedExam.percentage)}
                        </p>

                      </div>

                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10">

                        <p className="text-[10px] text-slate-500">
                          Result
                        </p>

                        <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-2">
                          {selectedExam.status}
                        </p>

                      </div>

                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">

                      <div className="flex items-center gap-2 mb-2">

                        <AlertCircle
                          size={15}
                          className="text-amber-600"
                        />

                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          Teacher Feedback
                        </p>

                      </div>

                      <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">

                        {selectedExam.feedback ||
                          "Your result has been published. Continue regular practice to improve your performance further."}

                      </p>

                    </div>

                  </>

                ) : (

                  <>

                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">

                      <div className="flex items-center gap-2 mb-2">

                        <Calendar
                          size={16}
                          className="text-amber-600"
                        />

                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          Upcoming Assessment
                        </p>

                      </div>

                      <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">

                        This examination is scheduled for{" "}
                        <strong>
                          {selectedExam.date}
                        </strong>{" "}
                        at{" "}
                        <strong>
                          {selectedExam.time || "N/A"}
                        </strong>
                        .

                      </p>

                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">

                      <div className="flex items-center gap-2 mb-2">

                        <BookOpen
                          size={15}
                          className="text-indigo-600"
                        />

                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          Exam Instructions
                        </p>

                      </div>

                      <ul className="space-y-2 text-[10px] text-slate-600 dark:text-slate-400">

                        <li>
                          • Be present before the scheduled examination time.
                        </li>

                        <li>
                          • Bring all required learning materials.
                        </li>

                        <li>
                          • Follow the teacher's instructions during the assessment.
                        </li>

                        <li>
                          • Maintain regular practice before the examination.
                        </li>

                      </ul>

                    </div>

                  </>

                )}

              </div>

            </div>

          </div>

        )}

    </div>
  );
}