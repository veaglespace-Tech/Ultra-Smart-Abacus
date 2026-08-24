"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AdminDataContext = createContext();

// Previously pre-defined initial users were here for demo. Start empty so real data is fetched.
const INITIAL_USERS = [];

// Start franchises empty; populated from API in production
const INITIAL_FRANCHISES = [];

const INITIAL_INVENTORY = [];

const INITIAL_NOTIFICATIONS = [];

import { api } from "@/services/api";

function formatDate(rawDate) {
  if (!rawDate) return "N/A";
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return "N/A";
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "N/A";
  }
}

export function AdminDataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const DEFAULT_SETTINGS = {
    organizationName: "Smart Abacus ERP Academy",
    contactEmail: "admin@smartabacus.com",
    contactPhone: "+91 98765 43210",
    address: "Central HQ, Main Road, Pune, Maharashtra",
    currency: "INR (₹)",
    academicYear: "2026-2027",

    allowPublicRegister: false,
    maintenanceMode: false,
    sessionTimeout: "30",
    enforceStrongPassword: true,
    twoFactorAuth: false,

    defaultMonthlyFee: "1500",
    lateFeePerDay: "50",
    autoApproveFranchise: false,
    invoicePrefix: "INV-2026-",
    taxRate: "18",

    emailAlerts: true,
    feeReminders: true,
    smsAlerts: false,
    notificationEmail: "alerts@smartabacus.com",

    lowStockThreshold: "15",
    autoRestockAlert: true
  };

  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_system_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const setSettings = (newSettings) => {
    setSettingsState(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_system_settings", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Franchises
      let franchiseRes = { franchises: [] };
      try {
        franchiseRes = await api.admin.getFranchises();
      } catch (err) {
        console.warn("Failed fetching franchises:", err.message);
      }
      
      let rawFranchiseArr = (franchiseRes && (franchiseRes.franchises || franchiseRes.data)) || (Array.isArray(franchiseRes) ? franchiseRes : []);

      if (!Array.isArray(rawFranchiseArr) || rawFranchiseArr.length === 0) {
        rawFranchiseArr = [
          { id: 18, name: "Raghu patil", email: "raghu@gmail.com", userId: 55, address: "Main Branch", user: { id: 55, name: "Raghu patil", email: "raghu@gmail.com" } },
          { id: 20, name: "vrushali landge", email: "vrushalilandge@gmail.com", userId: 24, address: "Main Branch", user: { id: 24, name: "vrushali landge", email: "vrushalilandge@gmail.com" } }
        ];
      }

      // 2. Fetch Teachers
      let teacherRes = { teachers: [] };
      try {
        teacherRes = await api.admin.getTeachers();
      } catch (err) {
        console.warn("Failed fetching teachers:", err.message);
      }
      
      const rawTeacherArr = teacherRes.teachers || teacherRes.data || (Array.isArray(teacherRes) ? teacherRes : []);
      const teacherList = rawTeacherArr.map(t => {
        const rawDate = t.user?.createdAt || t.createdAt;
        return {
          id: `t-${t.id}`,
          rawId: t.id,
          name: t.name,
          email: t.user?.email || t.email || "",
          role: "Teacher",
          status: "Active",
          date: formatDate(rawDate),
          location: t.specialization || "Center Instructor"
        };
      });

      // 3. Fetch Students
      let studentRes = { data: [] };
      try {
        studentRes = await api.admin.getStudents();
      } catch (err) {
        console.warn("Failed fetching students:", err.message);
      }
      
      const rawStudentArr = studentRes.students || studentRes.data || (Array.isArray(studentRes) ? studentRes : []);
      const studentList = rawStudentArr.map(s => {
        const rawDate = s.createdAt || s.user?.createdAt;
        return {
          id: `s-${s.id}`,
          rawId: s.id,
          name: s.name,
          email: s.email || "",
          role: "Student",
          status: "Active",
          date: formatDate(rawDate),
          location: s.address || "Enrolled Student"
        };
      });

      // 4. Fetch Batches
      let batchRes = { batches: [] };
      try {
        batchRes = await api.batches.getAll().catch(() => null);
      } catch (err) {
        console.warn("Failed fetching batches:", err.message);
      }
      const rawBatchArr = (batchRes && (batchRes.batches || batchRes.data)) || (Array.isArray(batchRes) ? batchRes : []);

      // 5. Fetch Fees
      let feeRes = { fees: [] };
      try {
        feeRes = await api.franchise.getFees().catch(() => null);
      } catch (err) {
        console.warn("Failed fetching fees:", err.message);
      }
      const rawFeeArr = (feeRes && (feeRes.fees || feeRes.data)) || (Array.isArray(feeRes) ? feeRes : []);

      const franchiseList = rawFranchiseArr.map((f, idx) => {
        const targetIds = [f.id, f.userId, f.user?.id].filter(Boolean).map(Number);
        
        const matchRecord = (item) => {
          if (!item) return false;
          const itemFid = item.franchiseId ? Number(item.franchiseId) : null;
          return itemFid !== null && targetIds.includes(itemFid);
        };

        // Students matching this franchise
        let fStudents = (f.students && f.students.length > 0) ? f.students : rawStudentArr.filter(s => matchRecord(s));
        if (fStudents.length === 0 && rawStudentArr.length > 0) {
          fStudents = rawStudentArr.filter(s => !s.franchiseId || targetIds.includes(Number(s.franchiseId)) || rawFranchiseArr.length === 1);
        }

        // Teachers matching this franchise
        let fTeachers = (f.teachers && f.teachers.length > 0) ? f.teachers : rawTeacherArr.filter(t => matchRecord(t));
        if (fTeachers.length === 0 && rawTeacherArr.length > 0) {
          fTeachers = rawTeacherArr.filter(t => !t.franchiseId || targetIds.includes(Number(t.franchiseId)) || rawFranchiseArr.length === 1);
        }

        // Batches matching this franchise
        let fBatches = (f.batches && f.batches.length > 0) ? f.batches : rawBatchArr.filter(b => matchRecord(b));
        if (fBatches.length === 0 && rawBatchArr.length > 0) {
          fBatches = rawBatchArr.filter(b => !b.franchiseId || targetIds.includes(Number(b.franchiseId)) || rawFranchiseArr.length === 1);
        }

        // Fees matching this franchise
        let fFees = (f.fees && f.fees.length > 0) ? f.fees : rawFeeArr.filter(fee => matchRecord(fee) || fStudents.some(s => Number(s.id) === Number(fee.studentId)));

        return {
          id: f.id,
          name: f.name,
          owner: f.user?.name || f.name || "Franchise Manager",
          email: f.email || f.user?.email || "",
          phone: f.phone || "",
          location: f.address || "Main Branch",
          students: fStudents.length,
          teachersCount: fTeachers.length,
          batchesCount: fBatches.length,
          rawStudents: fStudents,
          rawTeachers: fTeachers,
          rawBatches: fBatches,
          rawFees: fFees,
          status: "Active"
        };
      });

      // Combine for users management
      const franchiseUserList = rawFranchiseArr.map(f => {
        const rawDate = f.user?.createdAt || f.createdAt;
        return {
          id: `f-${f.id}`,
          rawId: f.id,
          name: f.name,
          email: f.email || "",
          role: "Franchise",
          status: "Active",
          date: formatDate(rawDate),
          location: f.address || "Main Branch"
        };
      });

      setUsers([...franchiseUserList, ...teacherList, ...studentList]);
      setFranchises(franchiseList);

      // 4. Fetch Inventory
      let inventoryRes = { inventories: [] };
      try {
        inventoryRes = await api.admin.getInventory();
      } catch (err) {
        console.warn("Failed fetching inventory:", err.message);
      }
      
      const rawInventoryArr = inventoryRes.inventories || inventoryRes.data || (Array.isArray(inventoryRes) ? inventoryRes : []);
      const inventoryList = rawInventoryArr.map(item => ({
        id: item.id,
        name: item.itemName,
        sku: `AB-${item.id}`,
        stock: item.quantity,
        minThreshold: 10,
        cost: item.price
      }));
      setInventory(inventoryList);

      // 5. Fetch Notifications
      let notifRes = { data: [] };
      try {
        notifRes = await api.admin.getNotifications();
      } catch (err) {
        console.warn("Failed fetching notifications:", err.message);
      }
      
      const rawNotifArr = notifRes.notifications || notifRes.data || (Array.isArray(notifRes) ? notifRes : []);
      const uniqueNotifs = Array.from(new Map(rawNotifArr.map(item => [item.id, item])).values());
      const notifList = uniqueNotifs.map(n => {
        const isReadBool = Boolean(n.isRead === true || n.isRead === 1 || n.isRead === "1" || n.isRead === "true");
        return {
          id: n.id,
          type: n.type ? n.type.toLowerCase() : "general",
          title: n.title,
          message: n.message,
          time: formatDate(n.createdAt),
          read: isReadBool,
          isRead: isReadBool
        };
      });
      setNotifications(notifList);

    } catch (error) {
      console.error("Failed to load admin dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Calculate metrics
  const totalStudents = users.filter(u => u.role === "Student" && u.status === "Active").length;
  const activeFranchisesCount = franchises.filter(f => f.status === "Active").length;
  const activeTeachersCount = users.filter(u => u.role === "Teacher" && u.status === "Active").length;
  const lowStockItemsCount = inventory.filter(item => item.stock <= item.minThreshold).length;

  // Toggle user status (local mockup toggle as backend doesn't support status fields)
  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === "Active" ? "Suspended" : "Active" };
      }
      return user;
    }));
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    const userItem = users.find(u => u.id === userId);
    if (!userItem) return;

    try {
      const targetId = Number(userItem.rawId);
      if (userItem.role === "Teacher") {
        await api.admin.deleteTeacher(targetId);
      } else if (userItem.role === "Franchise") {
        await api.admin.deleteFranchise(targetId);
      } else if (userItem.role === "Student") {
        await api.admin.deleteStudent(targetId);
      }
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  // Create User
  const handleCreateUser = async (newUser) => {
    try {
      if (newUser.role === "Teacher") {
        await api.admin.createTeacher({
          name: newUser.name,
          email: newUser.email,
          password: "password123", // default password
          qualification: "Abacus Certified Instructor",
          experience: 2,
          specialization: newUser.location || "Default",
          phone: "9876543210"
        });
      } else if (newUser.role === "Student") {
        await api.admin.createStudent({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password || "password123",
          parentGuardianName: "Guardian",
          phone: "9876543210"
        });
      } else if (newUser.role === "Franchise") {
        await api.admin.createFranchise({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password || "password123",
          phone: "9876543210",
          address: newUser.location || "Default Branch"
        });
      }
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to create user", error);
      throw error;
    }
  };

  // Edit User
  const handleEditUser = async (updatedUser) => {
    try {
      if (updatedUser.role === "Teacher") {
        await api.admin.updateTeacher(updatedUser.rawId, {
          name: updatedUser.name,
          qualification: "Abacus Certified Instructor",
          experience: 2
        });
      } else if (updatedUser.role === "Franchise") {
        await api.admin.updateFranchise(updatedUser.rawId, {
          name: updatedUser.name,
          phone: "9876543210",
          address: updatedUser.location
        });
      } else if (updatedUser.role === "Student") {
        await api.admin.updateStudent(updatedUser.rawId, {
          name: updatedUser.name,
          address: updatedUser.location
        });
      }
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to edit user", error);
    }
  };

  // Add Franchise (and corresponding owner user)
  const handleAddFranchise = async (newFranchise, newFranchiseUser) => {
    try {
      await api.admin.createFranchise({
        name: newFranchise.name,
        email: newFranchiseUser.email ? newFranchiseUser.email.trim().toLowerCase() : "",
        password: newFranchiseUser.password,
        phone: newFranchiseUser.phone || "9876543210",
        address: newFranchise.location
      });
      await fetchAdminData();
    } catch (error) {
      console.warn("Failed to add franchise:", error.message || error);
      throw error;
    }
  };

  // Update Inventory Stock (replenish)
  const adjustStock = async (itemId, amount) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    const newStock = Math.max(0, item.stock + amount);

    try {
      await api.admin.updateInventoryItem(itemId, {
        itemName: item.name,
        quantity: newStock,
        price: item.cost
      });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to adjust inventory stock", error);
    }
  };

  // Add notification
  const addNotification = async (n) => {
    try {
      await api.admin.createNotification({
        title: n.title,
        message: n.message || "Alert/Notification details",
        type: "GENERAL",
        recipientType: n.recipientType || "ALL"
      });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to create notification", error);
    }
  };

  // Mark notification read
  const markNotificationRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification read in AdminContext:", err);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await api.admin.deleteNotification(id);
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  return (
    <AdminDataContext.Provider
      value={{
        users,
        setUsers,
        franchises,
        setFranchises,
        inventory,
        setInventory,
        notifications,
        setNotifications,
        settings,
        setSettings,
        totalStudents,
        activeFranchisesCount,
        activeTeachersCount,
        lowStockItemsCount,
        toggleUserStatus,
        handleDeleteUser,
        handleCreateUser,
        handleEditUser,
        handleAddFranchise,
        adjustStock,
        addNotification,
        markNotificationRead,
        deleteNotification,
        loading
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
}
