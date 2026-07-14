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

    // Notifications
    getNotifications: () => apiHelper.get('/notifications/teacher'),
  },
  student: {
    getNotifications: () => apiHelper.get('/notifications/student/me'),
    getProfile: () => apiHelper.get('/students/profile/me'),
  },
  franchise: {
    getNotifications: () => apiHelper.get('/notifications/franchise'),
  },
  admin: {
    getTeachers: () => apiHelper.get('/teachers'),
    getFranchises: () => apiHelper.get('/franchise'),
    getStudents: () => apiHelper.get('/students'),
    getInventory: () => apiHelper.get('/inventory'),
    getNotifications: () => apiHelper.get('/notifications'),
    
    createTeacher: (data) => apiHelper.post('/teachers/register', data),
    createFranchise: (data) => apiHelper.post('/franchise/register', data),
    createStudent: (data) => apiHelper.post('/auth/register', { ...data, role: 'STUDENT' }),
    
    updateTeacher: (id, data) => apiHelper.put(`/teachers/${id}`, data),
    updateFranchise: (id, data) => apiHelper.put(`/franchise/${id}`, data),
    updateStudent: (id, data) => apiHelper.put(`/students/${id}`, data),
    
    deleteTeacher: (id) => apiHelper.delete(`/teachers/${id}`),
    deleteFranchise: (id) => apiHelper.delete(`/franchise/${id}`),
    deleteStudent: (id) => apiHelper.delete(`/students/${id}`),
    
    createInventoryItem: (data) => apiHelper.post('/inventory', data),
    updateInventoryItem: (id, data) => apiHelper.put(`/inventory/${id}`, data),
    deleteInventoryItem: (id) => apiHelper.delete(`/inventory/${id}`),
    
    createNotification: (data) => apiHelper.post('/notifications', data),
    deleteNotification: (id) => apiHelper.delete(`/notifications/${id}`),
  },
  batches: {
    getAll: () => apiHelper.get('/batches'),
    getById: (id) => apiHelper.get(`/batches/${id}`),
    create: (data) => apiHelper.post('/batches', data),
    update: (id, data) => apiHelper.put(`/batches/${id}`, data),
    delete: (id) => apiHelper.delete(`/batches/${id}`),
    getByCourse: (courseId) => apiHelper.get(`/batches/course/${courseId}`),
  },
  salary: {
    create: (data) => apiHelper.post('/salary', data),
    update: (id, data) => apiHelper.put(`/salary/${id}`, data),
    pay: (id, data) => apiHelper.patch(`/salary/${id}/pay`, data),
    getHistory: (teacherId) => apiHelper.get(`/salary/history${teacherId ? `?teacherId=${teacherId}` : ''}`),
    getMyHistory: () => apiHelper.get('/salary/my-history'),
    getDetails: (id) => apiHelper.get(`/salary/${id}`),
  }
};