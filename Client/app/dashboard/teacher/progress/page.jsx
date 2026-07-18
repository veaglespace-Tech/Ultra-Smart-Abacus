"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Award,
  Plus,
  Search,
  X,
  Target,
  History,
  UserRound,
  ClipboardCheck,
  BarChart3,
  MessageSquareText,
  Loader2,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function TeacherProgressPage() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] =
    useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assessment Form State
  const [marks, setMarks] = useState("");
  const [beadSpeed, setBeadSpeed] = useState("");
  const [oralSpeed, setOralSpeed] = useState("");
  const [visualSpeed, setVisualSpeed] = useState("");
  const [workbookCompletion, setWorkbookCompletion] =
    useState("");
  const [remarks, setRemarks] = useState("");
  const [perfLevel, setPerfLevel] =
    useState("Satisfactory");

  // Fetch Students and Batches
  const fetchProgressData = async () => {
    try {
      setLoading(true);

      const [studentsRes, batchesRes] = await Promise.all([
        api.admin.getStudents(),
        api.batches.getAll(),
      ]);

      const teacherBatchIds = new Set();
      const batchIdToName = {};
      const batchIdToLevel = {};

      if (batchesRes?.success) {
        batchesRes.data.forEach((batch) => {
          let extra = {};

          try {
            extra = JSON.parse(batch.description || "{}");
          } catch {
            extra = {};
          }

          const teacherName = extra.teacher || "";

          batchIdToName[batch.id] =
            batch.name || `Batch - ${batch.code}`;

          batchIdToLevel[batch.id] =
            batch.level || "Level 1 Core";

          if (
            user?.name &&
            teacherName.toLowerCase() ===
              user.name.toLowerCase()
          ) {
            teacherBatchIds.add(batch.id);
          }
        });
      }

      if (studentsRes?.success) {
        const mappedStudents = studentsRes.data
          .filter(
            (student) =>
              student.batchId &&
              teacherBatchIds.has(student.batchId)
          )
          .map((student) => ({
            id:
              student.rollNo ||
              `STU-${student.id}`,

            dbId: student.id,

            name: student.name,

            batch:
              batchIdToName[student.batchId] ||
              "Assigned",

            level:
              batchIdToLevel[student.batchId] ||
              "Level 1 Core",

            speedRating: "Steady",

            accuracy: 85,

            beadSpeed: 85,

            oralSpeed: 80,

            visualSpeed: 78,

            workbookCompletion: 82,

            status: "Satisfactory",

            remarks:
              "Regular practice is recommended to improve speed and accuracy.",

            lastAssessment: "Not Assessed",

            assessmentHistory: [],
          }));

        setStudentProgress(mappedStudents);
      }
    } catch (error) {
      console.error(
        "Failed to load progress details",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  // Open Assessment Modal
  const openAssessmentModal = (student) => {
    setSelectedStudent(student);

    setMarks(student.accuracy || "");
    setBeadSpeed(student.beadSpeed || "");
    setOralSpeed(student.oralSpeed || "");
    setVisualSpeed(student.visualSpeed || "");
    setWorkbookCompletion(
      student.workbookCompletion || ""
    );
    setRemarks(student.remarks || "");
    setPerfLevel(
      student.status || "Satisfactory"
    );

    setIsAssessmentModalOpen(true);
  };

  // Open Details Modal
  const openDetailsModal = (student) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  // Close Modals
  const closeAllModals = () => {
    setIsAssessmentModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedStudent(null);
  };

  // Save Assessment
  const handleSaveAssessment = (event) => {
    event.preventDefault();

    if (!selectedStudent) return;

    const accuracyValue = Math.min(
      100,
      Math.max(0, Number(marks) || 0)
    );

    const newAssessment = {
      date: new Date().toLocaleDateString(),
      accuracy: accuracyValue,
      beadSpeed: Number(beadSpeed) || 0,
      oralSpeed: Number(oralSpeed) || 0,
      visualSpeed: Number(visualSpeed) || 0,
      workbookCompletion:
        Number(workbookCompletion) || 0,
      status: perfLevel,
      remarks,
    };

    setStudentProgress((previousStudents) =>
      previousStudents.map((student) => {
        if (student.id !== selectedStudent.id) {
          return student;
        }

        let newSpeedRating = "Steady";

        if (perfLevel === "Excellent") {
          newSpeedRating = "Accelerated";
        }

        if (perfLevel === "Needs Improvement") {
          newSpeedRating = "Needs Practice";
        }

        return {
          ...student,

          accuracy: accuracyValue,

          beadSpeed:
            Number(beadSpeed) || 0,

          oralSpeed:
            Number(oralSpeed) || 0,

          visualSpeed:
            Number(visualSpeed) || 0,

          workbookCompletion:
            Number(workbookCompletion) || 0,

          speedRating: newSpeedRating,

          status: perfLevel,

          remarks,

          lastAssessment:
            newAssessment.date,

          assessmentHistory: [
            ...(student.assessmentHistory || []),
            newAssessment,
          ],
        };
      })
    );

    setIsAssessmentModalOpen(false);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6,
      },
    });
  };

  // Batch List
  const batches = [
    "All",
    ...new Set(
      studentProgress.map((student) => student.batch)
    ),
  ];

  // Filter Students
  const filteredProgress = useMemo(() => {
    return studentProgress.filter((student) => {
      const matchesSearch =
        student.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.batch
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesBatch =
        batchFilter === "All" ||
        student.batch === batchFilter;

      const matchesStatus =
        statusFilter === "All" ||
        student.status === statusFilter;

      return (
        matchesSearch &&
        matchesBatch &&
        matchesStatus
      );
    });
  }, [
    studentProgress,
    searchQuery,
    batchFilter,
    statusFilter,
  ]);

  // Calculate Overall Progress
  const calculateOverallProgress = (student) => {
    return Math.round(
      (
        Number(student.accuracy) +
        Number(student.beadSpeed) +
        Number(student.oralSpeed) +
        Number(student.visualSpeed) +
        Number(student.workbookCompletion)
      ) / 5
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">

        <div>

          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            PROGRESS TRACKER
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track student performance, evaluate learning progress and provide teacher feedback.
          </p>

        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">

          <TrendingUp size={16} />

          {studentProgress.length} Students

        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-[10px] uppercase tracking-wider font-black text-slate-500">
              Total Students
            </p>

            <UserRound size={18} className="text-indigo-500" />

          </div>

          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {studentProgress.length}
          </p>

        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-[10px] uppercase tracking-wider font-black text-slate-500">
              Excellent
            </p>

            <Award size={18} className="text-purple-500" />

          </div>

          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-3">

            {
              studentProgress.filter(
                (student) =>
                  student.status === "Excellent"
              ).length
            }

          </p>

        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-[10px] uppercase tracking-wider font-black text-slate-500">
              Satisfactory
            </p>

            <Target size={18} className="text-emerald-500" />

          </div>

          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3">

            {
              studentProgress.filter(
                (student) =>
                  student.status === "Satisfactory"
              ).length
            }

          </p>

        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-[10px] uppercase tracking-wider font-black text-slate-500">
              Needs Improvement
            </p>

            <TrendingUp size={18} className="text-amber-500" />

          </div>

          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-3">

            {
              studentProgress.filter(
                (student) =>
                  student.status ===
                  "Needs Improvement"
              ).length
            }

          </p>

        </div>

      </div>

      {/* FILTER SECTION */}

      <div className="flex flex-col lg:flex-row gap-3 justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl w-full lg:w-96">

          <Search size={14} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search student, roll number or batch..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-700 dark:text-slate-200"
          />

        </div>

        <div className="flex flex-col sm:flex-row gap-2">

          <select
            value={batchFilter}
            onChange={(event) =>
              setBatchFilter(event.target.value)
            }
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
          >

            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch === "All"
                  ? "All Batches"
                  : batch}
              </option>
            ))}

          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
          >

            <option value="All">
              All Performance
            </option>

            <option value="Excellent">
              Excellent
            </option>

            <option value="Satisfactory">
              Satisfactory
            </option>

            <option value="Needs Improvement">
              Needs Improvement
            </option>

          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">

                <th className="py-4 px-6">
                  Student Details
                </th>

                <th className="py-4 px-6">
                  Current Cohort
                </th>

                <th className="py-4 px-6">
                  Overall Progress
                </th>

                <th className="py-4 px-6">
                  Bead Pace
                </th>

                <th className="py-4 px-6">
                  Accuracy
                </th>

                <th className="py-4 px-6">
                  Status
                </th>

                <th className="py-4 px-6 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="py-16 text-center"
                  >

                    <Loader2
                      size={26}
                      className="animate-spin mx-auto text-indigo-500"
                    />

                    <p className="text-xs text-slate-500 mt-3">
                      Loading student progress...
                    </p>

                  </td>

                </tr>

              ) : filteredProgress.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="py-16 text-center"
                  >

                    <ClipboardCheck
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-xs font-bold text-slate-500 mt-3">
                      No student progress found
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Try changing your search or filters.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredProgress.map((student) => {

                  const overallProgress =
                    calculateOverallProgress(student);

                  return (

                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
                    >

                      <td className="py-4 px-6">

                        <button
                          onClick={() =>
                            openDetailsModal(student)
                          }
                          className="text-left group"
                        >

                          <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">

                            {student.name}

                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">

                            {student.id}

                          </span>

                        </button>

                      </td>

                      <td className="py-4 px-6">

                        <span className="font-bold text-slate-800 dark:text-slate-200 block">

                          {student.batch}

                        </span>

                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">

                          {student.level}

                        </span>

                      </td>

                      <td className="py-4 px-6">

                        <div className="flex items-center gap-2">

                          <span className="font-mono font-bold text-slate-900 dark:text-white">

                            {overallProgress}%

                          </span>

                          <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">

                            <div
                              className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full"
                              style={{
                                width: `${overallProgress}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      <td className="py-4 px-6">

                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40">

                          {student.speedRating}

                        </span>

                      </td>

                      <td className="py-4 px-6">

                        <span className="font-mono font-bold">

                          {student.accuracy}%

                        </span>

                      </td>

                      <td className="py-4 px-6">

                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            student.status === "Excellent"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400"
                              : student.status ===
                                "Satisfactory"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}
                        >

                          {student.status}

                        </span>

                      </td>

                      <td className="py-4 px-6 text-right">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openDetailsModal(student)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          >

                            <Eye size={12} />

                            View

                          </button>

                          <button
                            onClick={() =>
                              openAssessmentModal(student)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50"
                          >

                            <Plus size={12} />

                            Assess

                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ASSESSMENT MODAL */}

      {isAssessmentModalOpen &&
        selectedStudent && (

          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeAllModals}
          >

            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
            >

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">

                <div>

                  <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">

                    Add Student Assessment

                  </h3>

                  <p className="text-[10px] text-slate-500 mt-1">

                    {selectedStudent.name} •{" "}
                    {selectedStudent.id}

                  </p>

                </div>

                <button
                  onClick={closeAllModals}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >

                  <X size={16} />

                </button>

              </div>

              <form
                onSubmit={handleSaveAssessment}
                className="space-y-5 mt-5"
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                      Overall Accuracy (%)

                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={marks}
                      onChange={(event) =>
                        setMarks(event.target.value)
                      }
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                      Bead Movement Speed (%)

                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={beadSpeed}
                      onChange={(event) =>
                        setBeadSpeed(event.target.value)
                      }
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                      Oral Sum Speed (%)

                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={oralSpeed}
                      onChange={(event) =>
                        setOralSpeed(event.target.value)
                      }
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                      Visual Sum Speed (%)

                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={visualSpeed}
                      onChange={(event) =>
                        setVisualSpeed(event.target.value)
                      }
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                      Workbook Completion (%)

                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={workbookCompletion}
                      onChange={(event) =>
                        setWorkbookCompletion(
                          event.target.value
                        )
                      }
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                      Performance Rating

                    </label>

                    <select
                      value={perfLevel}
                      onChange={(event) =>
                        setPerfLevel(event.target.value)
                      }
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                    >

                      <option value="Excellent">
                        Excellent
                      </option>

                      <option value="Satisfactory">
                        Satisfactory
                      </option>

                      <option value="Needs Improvement">
                        Needs Improvement
                      </option>

                    </select>

                  </div>

                </div>

                <div>

                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">

                    Teacher Feedback / Remarks

                  </label>

                  <textarea
                    rows="4"
                    required
                    value={remarks}
                    onChange={(event) =>
                      setRemarks(event.target.value)
                    }
                    placeholder="Enter student strengths, weaknesses and improvement suggestions..."
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-medium outline-none focus:border-indigo-500"
                  />

                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">

                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                  >

                    Cancel

                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                  >

                    Save Assessment

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {/* STUDENT DETAILS MODAL */}

      {isDetailsModalOpen &&
        selectedStudent && (

          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeAllModals}
          >

            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
            >

              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">

                <div>

                  <h3 className="font-black text-slate-900 dark:text-white text-lg">

                    {selectedStudent.name}

                  </h3>

                  <p className="text-xs text-slate-500 mt-1">

                    {selectedStudent.id} •{" "}
                    {selectedStudent.batch} •{" "}
                    {selectedStudent.level}

                  </p>

                </div>

                <button
                  onClick={closeAllModals}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >

                  <X size={16} />

                </button>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">

                  <p className="text-[10px] text-slate-500">
                    Accuracy
                  </p>

                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">

                    {selectedStudent.accuracy}%

                  </p>

                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">

                  <p className="text-[10px] text-slate-500">
                    Bead Speed
                  </p>

                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">

                    {selectedStudent.beadSpeed}%

                  </p>

                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10">

                  <p className="text-[10px] text-slate-500">
                    Workbook
                  </p>

                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">

                    {selectedStudent.workbookCompletion}%

                  </p>

                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10">

                  <p className="text-[10px] text-slate-500">
                    Overall Progress
                  </p>

                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">

                    {calculateOverallProgress(
                      selectedStudent
                    )}
                    %

                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">

                  <div className="flex items-center gap-2 mb-4">

                    <BarChart3
                      size={16}
                      className="text-indigo-500"
                    />

                    <h4 className="text-xs font-black uppercase tracking-wider">

                      Performance Metrics

                    </h4>

                  </div>

                  <div className="space-y-4">

                    {[
                      [
                        "Bead Movement",
                        selectedStudent.beadSpeed,
                      ],
                      [
                        "Oral Sum Speed",
                        selectedStudent.oralSpeed,
                      ],
                      [
                        "Visual Sum Speed",
                        selectedStudent.visualSpeed,
                      ],
                      [
                        "Workbook Completion",
                        selectedStudent.workbookCompletion,
                      ],
                    ].map(([label, value]) => (

                      <div key={label}>

                        <div className="flex justify-between text-[10px] font-bold mb-1">

                          <span>{label}</span>

                          <span>{value}%</span>

                        </div>

                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${value}%`,
                            }}
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">

                  <div className="flex items-center gap-2 mb-4">

                    <MessageSquareText
                      size={16}
                      className="text-amber-500"
                    />

                    <h4 className="text-xs font-black uppercase tracking-wider">

                      Teacher Feedback

                    </h4>

                  </div>

                  <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">

                    {selectedStudent.remarks ||
                      "No feedback available yet."}

                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">

                    <p className="text-[10px] text-slate-500">
                      Last Assessment
                    </p>

                    <p className="text-xs font-bold mt-1">

                      {selectedStudent.lastAssessment}

                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-5 border border-slate-200 dark:border-slate-800 rounded-xl p-5">

                <div className="flex items-center gap-2 mb-4">

                  <History
                    size={16}
                    className="text-indigo-500"
                  />

                  <h4 className="text-xs font-black uppercase tracking-wider">

                    Assessment History

                  </h4>

                </div>

                {selectedStudent.assessmentHistory?.length >
                0 ? (

                  <div className="space-y-3">

                    {selectedStudent.assessmentHistory
                      .slice()
                      .reverse()
                      .map((assessment, index) => (

                        <div
                          key={index}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800"
                        >

                          <div className="flex flex-col sm:flex-row justify-between gap-2">

                            <div>

                              <p className="text-xs font-bold">

                                {assessment.status}

                              </p>

                              <p className="text-[10px] text-slate-500 mt-1">

                                {assessment.date}

                              </p>

                            </div>

                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">

                              {assessment.accuracy}%

                            </p>

                          </div>

                          <p className="text-[10px] text-slate-500 mt-3">

                            {assessment.remarks}

                          </p>

                        </div>

                      ))}

                  </div>

                ) : (

                  <div className="text-center py-8">

                    <History
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-xs text-slate-500 mt-2">

                      No assessment history available.

                    </p>

                  </div>

                )}

              </div>

              <div className="flex justify-end gap-3 mt-5">

                <button
                  onClick={() =>
                    openAssessmentModal(
                      selectedStudent
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >

                  <Plus size={14} />

                  Add New Assessment

                </button>

                <button
                  onClick={closeAllModals}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >

                  Close

                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}