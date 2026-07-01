"use client";

import React, { createContext, useContext, useState } from "react";

const StudentDataContext = createContext();

const INITIAL_PROFILE = {
  name: "Neha Patel",
  rollNo: "SA-2026-089",
  email: "neha@abacus.com",
  phone: "+91 98765 43210",
  parentName: "Rajesh Patel",
  admissionDate: "2026-06-12",
  center: "Mumbai West Franchise",
  level: "1",
  batch: "Weekend Batch A",
  progress: 68,
  classesAttended: 12,
  totalClasses: 18,
  assignmentsDone: 8,
  assignmentsTotal: 10
};

const INITIAL_EXAMS = [
  { id: 1, name: "Level 1 Midterm Exam", date: "2026-06-25", time: "10:00 AM", status: "Scheduled", duration: "60 mins" },
  { id: 2, name: "Oral Speed Arithmetic Drill", date: "2026-07-02", time: "11:30 AM", status: "Scheduled", duration: "30 mins" },
  { id: 101, name: "Level 1 Diagnostic Assessment", date: "2026-06-12", score: "88/100", status: "Passed", duration: "45 mins" },
  { id: 102, name: "Basics of Bead Value Quiz", date: "2026-06-14", score: "95/100", status: "Passed", duration: "20 mins" }
];

const INITIAL_FEES = [
  { id: 1, description: "Level 1 Registration Fee", amount: 100, date: "2026-06-12", status: "Paid", txId: "TXN-901827" },
  { id: 2, description: "Workbook Kit Charges (Set of A & B)", amount: 50, date: "2026-06-12", status: "Paid", txId: "TXN-901828" },
  { id: 3, description: "Monthly Tuition Fee - June 2026", amount: 150, date: "2026-06-15", status: "Pending", txId: "-" }
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: "Level 1 Workbook Kit Dispatched", sender: "Admin (Saideep)", time: "2 hours ago", text: "Your Standard 17-Rod Student Abacus kit and Level 1 Workbooks (A & B) have been issued by the franchise center and are ready for pickup." },
  { id: 2, title: "Upcoming Live Class Session", sender: "Aman Sharma (Teacher)", time: "1 day ago", text: "Please make sure to have your physical abacus tool ready for tomorrow's online session on bead representation and speed calculations." },
  { id: 3, title: "Welcome to Smart Abacus Academy!", sender: "System", time: "6 days ago", text: "Your account is created. Access training materials, review assignment lists, and monitor progress charts here." }
];

const INITIAL_ASSIGNMENTS = [
  { id: 1, title: "Workbook Exercise 2.1 & 2.2", dueDate: "2026-06-20", status: "Pending", points: "10 pts", difficulty: "Medium" },
  { id: 2, title: "Single Digit Addition Speed Test", dueDate: "2026-06-22", status: "Pending", points: "15 pts", difficulty: "Hard" },
  { id: 3, title: "Bead Values Practice Sheet", dueDate: "2026-06-14", status: "Completed", points: "10 pts", difficulty: "Easy" },
  { id: 4, title: "Level 1 Starter Warm-up Exercises", dueDate: "2026-06-13", status: "Completed", points: "10 pts", difficulty: "Easy" }
];

export function StudentDataProvider({ children }) {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [fees, setFees] = useState(INITIAL_FEES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

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
