// src/services/api.js
import { apiHelper } from './apiHelper';

export const api = {
  auth: {
    login: (credentials) => apiHelper.post('/auth/login', credentials),
    getCurrentUser: () => apiHelper.get('/auth/me'),
  },
  teacher: {
    // Attendance Actions
    getAttendance: (batchId, date) => apiHelper.get(`/teacher/attendance?batchId=${batchId}&date=${date}`),
    submitAttendance: (data) => apiHelper.post('/teacher/attendance', data),
    
    // Batch Controls
    getBatches: () => apiHelper.get('/teacher/batches'),
    getBatchRoster: (batchId) => apiHelper.get(`/teacher/batches/${batchId}/students`),
    
    // Exam & Marks Processing
    getExamRecords: (levelId) => apiHelper.get(`/teacher/exams?levelId=${levelId}`),
    submitMarks: (examData) => apiHelper.post('/teacher/exams/submit', examData),
    
    // Analytics & Telemetry
    getStudentProgress: () => apiHelper.get('/teacher/analytics/progress'),
    
    // Backup Sessions Management
    getCompensatorySlots: () => apiHelper.get('/teacher/compensatory-classes'),
    bookBackupSlot: (payload) => apiHelper.post('/teacher/compensatory-classes', payload),
    
    // Payroll Ledger
    getSalaryHistory: () => apiHelper.get('/teacher/salary'),
  }
};