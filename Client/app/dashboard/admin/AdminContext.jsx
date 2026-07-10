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

export function AdminDataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    allowPublicRegister: false,
    maintenanceMode: false,
    emailAlerts: true,
    autoApproveFranchise: false
  });

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Franchises
      let franchiseRes = { franchises: [] };
      try {
        franchiseRes = await api.admin.getFranchises();
      } catch (err) {
        console.error("Failed fetching franchises:", err);
        throw new Error(`Franchises API: ${err.message}`);
      }
      
      const franchiseList = (franchiseRes.franchises || []).map(f => ({
        id: f.id,
        name: f.name,
        owner: f.user?.name || "Unknown",
        location: f.address || "Unspecified",
        students: 0,
        status: "Active"
      }));

      // 2. Fetch Teachers
      let teacherRes = { teachers: [] };
      try {
        teacherRes = await api.admin.getTeachers();
      } catch (err) {
        console.error("Failed fetching teachers:", err);
        throw new Error(`Teachers API: ${err.message}`);
      }
      
      const teacherList = (teacherRes.teachers || []).map(t => ({
        id: `t-${t.id}`,
        rawId: t.id,
        name: t.name,
        email: t.user?.email || "",
        role: "Teacher",
        status: "Active",
        date: t.user?.createdAt ? t.user.createdAt.split("T")[0] : "",
        location: t.specialization || "Not Assigned"
      }));

      // 3. Fetch Students
      let studentRes = { data: [] };
      try {
        studentRes = await api.admin.getStudents();
      } catch (err) {
        console.error("Failed fetching students:", err);
        throw new Error(`Students API: ${err.message}`);
      }
      
      const studentList = (studentRes.data || []).map(s => ({
        id: `s-${s.id}`,
        rawId: s.id,
        name: s.name,
        email: s.email,
        role: "Student",
        status: "Active",
        date: s.createdAt ? s.createdAt.split("T")[0] : "",
        location: s.address || "Not Assigned"
      }));

      // Combine for users management (Franchise also gets represented as user)
      const franchiseUserList = (franchiseRes.franchises || []).map(f => ({
        id: `f-${f.id}`,
        rawId: f.id,
        name: f.name,
        email: f.email,
        role: "Franchise",
        status: "Active",
        date: "",
        location: f.address || "Not Assigned"
      }));

      setUsers([...franchiseUserList, ...teacherList, ...studentList]);
      setFranchises(franchiseList);

      // 4. Fetch Inventory
      let inventoryRes = { inventories: [] };
      try {
        inventoryRes = await api.admin.getInventory();
      } catch (err) {
        console.error("Failed fetching inventory:", err);
        throw new Error(`Inventory API: ${err.message}`);
      }
      
      const inventoryList = (inventoryRes.inventories || []).map(item => ({
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
        console.error("Failed fetching notifications:", err);
        throw new Error(`Notifications API: ${err.message}`);
      }
      
      const notifList = (notifRes.data || []).map(n => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
        read: false
      }));
      setNotifications(notifList);

    } catch (error) {
      console.error("Failed to load admin dashboard data", error);
      throw error;
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
      if (userItem.role === "Teacher") {
        await api.admin.deleteTeacher(userItem.rawId);
      } else if (userItem.role === "Franchise") {
        await api.admin.deleteFranchise(userItem.rawId);
      } else if (userItem.role === "Student") {
        await api.admin.deleteStudent(userItem.rawId);
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
          password: "password123",
          parentGuardianName: "Guardian",
          phone: "9876543210"
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

  // Mark notification read (local toggle)
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
        deleteNotification
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
