"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const StudentDataContext = createContext();

const INITIAL_PROFILE = {
  id: null,
  name: "Student",
  rollNo: "STU-2026-001",
  email: "",
  phone: "",
  parentName: "",
  admissionDate: "7/29/2026",
  center: "Main Academy Center",
  level: "1",
  batch: "Afternoon Batch",
  profilePhoto: null,
  progress: 0,
  classesAttended: 0,
  totalClasses: 0,
  assignmentsDone: 0,
  assignmentsTotal: 0
};

const INITIAL_FEES = [];
const INITIAL_ASSIGNMENTS = [];

const DEFAULT_STUDENT_EXAMS = [
  {
    id: "EXAM-2026-001",
    name: "Level 1 Abacus Core Assessment",
    batch: "Level 1 Core Batch",
    date: "7/25/2026",
    time: "10:00 AM",
    duration: "60 mins",
    maxMarks: 100,
    passingMarks: 40,
    score: 92,
    grade: "A+",
    status: "Passed",
    feedback: "Excellent speed and accuracy in two-digit addition.",
  },
  {
    id: "EXAM-2026-002",
    name: "Mental Arithmetic Speed Challenge",
    batch: "Level 1 Core Batch",
    date: "7/18/2026",
    time: "11:30 AM",
    duration: "45 mins",
    maxMarks: 100,
    passingMarks: 40,
    score: 88,
    grade: "A",
    status: "Passed",
    feedback: "Great performance on visualization rules.",
  },
  {
    id: "EXAM-2026-003",
    name: "Grand Abacus Level 2 Eligibility Test",
    batch: "Level 1 Core Batch",
    date: "8/10/2026",
    time: "10:00 AM",
    duration: "60 mins",
    maxMarks: 100,
    passingMarks: 40,
    score: null,
    grade: null,
    status: "Scheduled",
    feedback: "Upcoming assessment scheduled for next month.",
  }
];

export function StudentDataProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [exams, setExams] = useState(DEFAULT_STUDENT_EXAMS);
  const [fees, setFees] = useState(INITIAL_FEES);
  const [notifications, setNotifications] = useState([]);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  // fetch fees function moved to component scope so it can be called by UI
  const fetchFees = async () => {
    try {
      const res = await api.student.getMyFees();
      console.debug('GET /fees/me response:', res);
      if (res && res.success) {
        const mapped = (res.data || []).map(f => ({
          id: f.id,
          description: f.description || `Tuition Fee #${f.id}`,
          txId: f.txId || '',
          // pick the last payment record if available
          lastPaymentId: f.payments && f.payments.length ? f.payments[f.payments.length - 1].id : null,
          lastPaymentTxId: f.payments && f.payments.length ? f.payments[f.payments.length - 1].txId : (f.txId || null),
          lastPaymentAmount: f.payments && f.payments.length ? f.payments[f.payments.length - 1].amount : (f.paidAmount && f.paidAmount > 0 ? f.paidAmount : 0),
          amount: f.paidAmount && f.paidAmount > 0 ? f.paidAmount : (f.totalAmount || 0),
          date: f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''),
          status: f.status ? (f.status === 'PAID' ? 'Paid' : f.status === 'PARTIAL' ? 'Partial' : 'Pending') : 'Pending',
          remarks: f.remarks || ''
        }));
        console.debug('Mapped student fees:', mapped);
        setFees(mapped);
        return mapped;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch student fees:', err);
      return [];
    }
  };

  useEffect(() => {
    if (user && user.role && user.role.toUpperCase() === "STUDENT") {
      const fetchStudentProfile = async () => {
        try {
          const res = await api.student.getProfile();
          const s = (res && (res.data || res.student)) ? (res.data || res.student) : null;
          if (s) {
            setProfile((prev) => ({
              ...prev,
              id: s.id,
              name: s.name || user.name || prev.name,
              email: s.email || user.email || prev.email,
              rollNo: s.rollNo || prev.rollNo,
              phone: s.phone || user.phone || prev.phone,
              parentName: s.fatherName || user.parentGuardianName || prev.parentName,
              admissionDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : prev.admissionDate,
              gender: s.gender || user.gender || prev.gender,
              address: s.address || user.address || prev.address,
              batch: s.batch ? (s.batch.name || `Batch - ${s.batch.code}`) : 'Unassigned',
              level: s.batch ? (s.batch.level || prev.level) : prev.level,
              profilePhoto: s.profilePhoto || user.profilePhoto || prev.profilePhoto,
            }));
          }
        } catch (err) {
          console.warn("Using default student profile:", err.message);
          setProfile((prev) => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
            parentName: user.parentGuardianName || prev.parentName,
            profilePhoto: user.profilePhoto || prev.profilePhoto,
          }));
        }
      };

      fetchStudentProfile();
      
      // Fetch dynamic student notifications
      const fetchNotifications = async () => {
        try {
          const res = await api.student.getNotifications();
          const rawList = res.data || res.notifications || [];
          const uniqueList = Array.from(new Map(rawList.map(item => [item.id, item])).values());
          const list = uniqueList.map(n => ({
            id: n.id,
            title: n.title,
            sender: "Academy Office",
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
            text: n.message,
            isRead: Boolean(n.isRead === true || n.isRead === 1 || n.isRead === "1" || n.isRead === "true")
          }));
          setNotifications(list);
        } catch (err) {
          console.error("Failed to fetch student notifications:", err);
        }
      };
      
      fetchNotifications();
      // fetch fees
      fetchFees();

      // Fetch dynamic student exams
      const fetchExams = async () => {
        try {
          const res = await api.exams.getStudentExams();
          if (res && res.success && res.data) {
            const mapped = (res.data || []).map((ex) => {
              const myResult = ex.results && ex.results.length > 0 ? ex.results[0] : null;
              const hasScore = myResult && myResult.obtainedMarks !== null && myResult.obtainedMarks !== undefined;
              const isPublished = ex.status === 'PUBLISHED' || ex.status === 'RESULT_PENDING' || ex.status === 'COMPLETED' || hasScore || (myResult && myResult.publishedAt);
              
              const finalScore = hasScore ? myResult.obtainedMarks : (isPublished && myResult ? myResult.obtainedMarks : null);
              const finalGrade = myResult?.grade || (hasScore ? (myResult.obtainedMarks >= (ex.passingMarks || 40) ? 'A' : 'F') : null);
              const isPass = myResult?.isPassed ?? (hasScore ? myResult.obtainedMarks >= (ex.passingMarks || 40) : false);

              const formatDateStr = (d1, d2) => {
                if (d1) {
                  try {
                    const dt = new Date(d1);
                    if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
                  } catch (e) {}
                }
                if (d2) {
                  try {
                    const dt = new Date(d2);
                    if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
                  } catch (e) {}
                }
                return new Date().toLocaleDateString();
              };

              return {
                id: ex.examCode || `EX-${ex.id}`,
                backendId: ex.id,
                name: ex.title,
                batch: ex.batch?.name || (ex.batch?.code ? `Batch ${ex.batch.code}` : 'General Batch'),
                date: formatDateStr(ex.examDate, ex.createdAt),
                time: ex.startTime || '10:00 AM',
                duration: ex.duration ? (typeof ex.duration === 'number' ? `${ex.duration} mins` : ex.duration) : '60 mins',
                maxMarks: ex.totalMarks || 100,
                passingMarks: ex.passingMarks || 40,
                score: finalScore,
                grade: finalGrade,
                status: hasScore ? (isPass ? 'Passed' : 'Completed') : (isPublished ? 'Completed' : 'Scheduled'),
                feedback: myResult?.remarks || 'Your assessment details are logged.',
              };
            });
            setExams(mapped.length > 0 ? mapped : DEFAULT_STUDENT_EXAMS);
          }
        } catch (err) {
          console.error("Failed to fetch student exams:", err);
        }
      };

      fetchExams();
    }
  }, [user]);

  const updateProfile = (updatedProfile) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const submitAssignment = (id) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: "Completed" };
      }
      return a;
    }));
    setProfile(prev => ({
      ...prev,
      assignmentsDone: Math.min(prev.assignmentsTotal, prev.assignmentsDone + 1)
    }));
  };

  const payFee = (id, txId) => {
    setFees(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, status: "Paid", txId };
      }
      return f;
    }));
  };

  return (
    <StudentDataContext.Provider
      value={{
        profile,
        setProfile,
        exams,
        setExams,
        fees,
        setFees,
        fetchFees,
        notifications,
        setNotifications,
        assignments,
        setAssignments,
        updateProfile,
        submitAssignment,
        payFee
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error("useStudentData must be used within a StudentDataProvider");
  }
  return context;
}
