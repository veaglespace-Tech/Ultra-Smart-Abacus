"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const StudentDataContext = createContext();

const INITIAL_PROFILE = {
  id: null,
  name: "",
  rollNo: "",
  email: "",
  phone: "",
  parentName: "",
  admissionDate: "",
  center: "",
  level: "",
  batch: "",
  profilePhoto: null,
  progress: 0,
  classesAttended: 0,
  totalClasses: 0,
  assignmentsDone: 0,
  assignmentsTotal: 0
};

const INITIAL_EXAMS = [];
const INITIAL_FEES = [];
const INITIAL_NOTIFICATIONS = [];
const INITIAL_ASSIGNMENTS = [];

export function StudentDataProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [exams, setExams] = useState(INITIAL_EXAMS);
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
    if (user) {
      const fetchStudentProfile = async () => {
        try {
          const res = await api.student.getProfile();
          if (res && res.success && res.data) {
            const s = res.data;
            setProfile((prev) => ({
              ...prev,
              name: s.name || user.name || prev.name,
              email: s.email || user.email || prev.email,
              rollNo: s.rollNo || prev.rollNo,
              phone: s.phone || prev.phone,
              parentName: s.fatherName || prev.parentName,
              admissionDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : prev.admissionDate,
              gender: s.gender || prev.gender,
              address: s.address || prev.address,
              batch: s.batch ? (s.batch.name || `Batch - ${s.batch.code}`) : 'Unassigned',
              level: s.batch ? (s.batch.level || prev.level) : prev.level,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch student profile:", err);
          setProfile((prev) => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
          }));
        }
      };

      fetchStudentProfile();
      
      // Fetch dynamic student notifications
      const fetchNotifications = async () => {
        try {
          const res = await api.student.getNotifications();
          const list = (res.data || []).map(n => ({
            id: n.id,
            title: n.title,
            sender: "Academy Office",
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
            text: n.message
          }));
          setNotifications(list);
        } catch (err) {
          console.error("Failed to fetch student notifications:", err);
        }
      };
      
      fetchNotifications();
      // fetch fees
      fetchFees();
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
