// src/services/api.js
import axiosInstance from './axios';

export const api = {
  auth: {
    login: (credentials) => axiosInstance.post('/auth/login', credentials),
    getCurrentUser: () => axiosInstance.get('/auth/me'),
  },
  teacher: {
    // Attendance Actions
    getAttendance: (batchId, date) => axiosInstance.get(`/teacher/attendance?batchId=${batchId}&date=${date}`),
    submitAttendance: (data) => axiosInstance.post('/teacher/attendance', data),
    
    // Batch Controls
    getBatches: () => axiosInstance.get('/teacher/batches'),
    getBatchRoster: (batchId) => axiosInstance.get(`/teacher/batches/${batchId}/students`),
    
    // Exam & Marks Processing
    getExamRecords: (levelId) => axiosInstance.get(`/teacher/exams?levelId=${levelId}`),
    submitMarks: (examData) => axiosInstance.post('/teacher/exams/submit', examData),
    
    // Analytics & Telemetry
    getStudentProgress: () => axiosInstance.get('/teacher/analytics/progress'),
    
    // Backup Sessions Management
    getCompensatorySlots: () => axiosInstance.get('/teacher/compensatory-classes'),
    bookBackupSlot: (payload) => axiosInstance.post('/teacher/compensatory-classes', payload),
    
    // Payroll Ledger
    getSalaryHistory: () => axiosInstance.get('/teacher/salary'),
  }
};