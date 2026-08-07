// src/services/api.js
import { apiHelper } from './apiHelper';

export const api = {
  public: {
    submitInquiry: (data) => apiHelper.post('/notifications/public-inquiry', data),
  },
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
    getMyFees: () => apiHelper.get('/fees/me'),
    downloadReceipt: (id) => apiHelper.get(`/fees/${id}/receipt`),
  },
  franchise: {
    getNotifications: () => apiHelper.get('/notifications/franchise'),
    getFees: () => apiHelper.get('/fees'),
    getFeeById: (id) => apiHelper.get(`/fees/${id}`),
    createFee: (data) => apiHelper.post('/fees', data),
    updateFee: (id, data) => apiHelper.put(`/fees/${id}`, data),
    deleteFee: (id) => apiHelper.delete(`/fees/${id}`),
    getFeeAnalytics: () => Promise.resolve({ success: true, data: { totalCollected: 0, totalPending: 0, overdue: 0, totalRecords: 0 } }),
    recordPayment: (id, data) => apiHelper.post(`/fees/${id}/payment`, { amount: data.amount, paymentMode: data.paymentMode || "UPI", referenceNumber: data.referenceNumber || "", remarks: data.notes || "" }),
    sendReminder: (id) => Promise.resolve({ success: true, message: "Reminder simulated successfully" }),
    getStudentById: (id) => apiHelper.get(`/students/${id}`),
    getProfile: () => apiHelper.get('/franchise/profile'),
    updateProfile: (data) => apiHelper.put('/franchise/profile', data),
    getDashboardMetrics: () => apiHelper.get('/franchise/metrics'),
    getStudents: () => apiHelper.get('/students'),
    createStudent: (data) => apiHelper.post('/students', data),
    admitStudentById: (data) => apiHelper.post('/students/admit-by-id', data),
    updateStudent: (id, data) => apiHelper.put(`/students/${id}`, data),
    deleteStudent: (id) => apiHelper.delete(`/students/${id}`),
    getTeachers: () => apiHelper.get('/teachers'),
    getBatches: () => apiHelper.get('/batches'),
    getInventory: () => apiHelper.get('/inventory'),
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
  inventory: {
    getAll: (params) => apiHelper.get('/inventory' + (params ? '?' + new URLSearchParams(params).toString() : '')),
    getById: (id) => apiHelper.get(`/inventory/${id}`),
    create: (data) => apiHelper.post('/inventory', data),
    update: (id, data) => apiHelper.put(`/inventory/${id}`, data),
    delete: (id) => apiHelper.delete(`/inventory/${id}`),
    distribute: (data) => apiHelper.patch('/inventory/distribute', data),
    getLowStock: () => apiHelper.get('/inventory/low-stock'),
    getHistory: () => apiHelper.get('/inventory/history'),
  },
  notifications: {
    getAll: () => apiHelper.get('/notifications'),
    getForRole: (role) => {
      if (role === 'ADMIN') return apiHelper.get('/notifications');
      if (role === 'FRANCHISE') return apiHelper.get('/notifications/franchise');
      if (role === 'TEACHER') return apiHelper.get('/notifications/teacher');
      if (role === 'STUDENT') return apiHelper.get('/notifications/student/me');
      return apiHelper.get('/notifications');
    },
    markRead: (id) => apiHelper.patch(`/notifications/${id}/read`),
    markAllRead: () => apiHelper.patch('/notifications/read-all'),
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
  },
  attendance: {
    mark: (data) => apiHelper.post('/attendance/mark', data),
    update: (id, data) => apiHelper.put(`/attendance/${id}`, data),
    getByStudent: (studentId) => apiHelper.get(`/attendance/student/${studentId}`),
    getByBatchAndDate: (batchId, date) => apiHelper.get(`/attendance?batchId=${batchId}&date=${date}`),
    delete: (id) => apiHelper.delete(`/attendance/${id}`),
  },
  exams: {
    getAll: (params) => apiHelper.get('/exams' + (params ? '?' + new URLSearchParams(params).toString() : '')),
    getById: (id) => apiHelper.get(`/exams/${id}`),
    create: (data) => apiHelper.post('/exams', data),
    update: (id, data) => apiHelper.put(`/exams/${id}`, data),
    delete: (id) => apiHelper.delete(`/exams/${id}`),
    submitMarks: (id, studentMarks) => apiHelper.post(`/exams/${id}/marks`, { studentMarks }),
    publishResults: (id) => apiHelper.patch(`/exams/${id}/publish`),
    getStudentExams: () => apiHelper.get('/exams/student/me'),
  }
};