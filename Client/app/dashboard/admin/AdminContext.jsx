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
  const [settings, setSettingsState] = useState({
    allowPublicRegister: false,
    maintenanceMode: false,
    emailAlerts: true,
    autoApproveFranchise: false
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_system_settings");
      if (saved) {
        try {
          setSettingsState(JSON.parse(saved));
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
      
      const rawFranchiseArr = franchiseRes.franchises || franchiseRes.data || (Array.isArray(franchiseRes) ? franchiseRes : []);
      const franchiseList = rawFranchiseArr.map(f => ({
        id: f.id,
        name: f.name,
        owner: f.user?.name || f.name || "Vrushali Landge",
        location: f.address || "Main Branch",
        students: 0,
        status: "Active"
      }));

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
      throw error;
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
        email: newFranchiseUser.email,
        password: newFranchiseUser.password,
        phone: newFranchiseUser.phone || "9876543210",
        address: newFranchise.location
      });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to add franchise", error);
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
