"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AdminDataContext = createContext();

// Pre-defined initial users to populate the mock database
const INITIAL_USERS = [
  { id: 1, name: "Delhi Central Academy", email: "delhi@abacus.com", role: "Franchise", status: "Active", date: "2026-05-10", location: "New Delhi" },
  { id: 2, name: "Aman Sharma", email: "aman@abacus.com", role: "Teacher", status: "Active", date: "2026-06-02", location: "New Delhi" },
  { id: 3, name: "Neha Patel", email: "neha@abacus.com", role: "Student", status: "Active", date: "2026-06-12", location: "Mumbai West" },
  { id: 4, name: "Mumbai West Franchise", email: "mumbai@abacus.com", role: "Franchise", status: "Active", date: "2026-06-15", location: "Mumbai" },
  { id: 5, name: "Sarah Jenkins", email: "sarah.j@abacus.com", role: "Teacher", status: "Suspended", date: "2026-04-18", location: "Bangalore" },
  { id: 6, name: "Kunal Verma", email: "kunal@abacus.com", role: "Student", status: "Active", date: "2026-06-16", location: "Delhi Central" }
];

// Initial mock franchises
const INITIAL_FRANCHISES = [
  { id: 1, name: "Delhi Central Academy", owner: "Rajesh Kumar", location: "Connaught Place, Delhi", students: 180, status: "Active" },
  { id: 2, name: "Mumbai West Franchise", owner: "Priya Desai", location: "Andheri West, Mumbai", students: 125, status: "Active" },
  { id: 3, name: "Bangalore East Center", owner: "Srinivas Raju", location: "Indiranagar, Bangalore", students: 95, status: "Active" },
  { id: 4, name: "Chennai North Hub", owner: "Meenakshi Sundaram", location: "T-Nagar, Chennai", students: 60, status: "Pending Approval" }
];

// Initial mock inventory
const INITIAL_INVENTORY = [
  { id: 1, name: "Standard 17-Rod Student Abacus", sku: "AB-STUD-17", stock: 450, minThreshold: 100, cost: 5 },
  { id: 2, name: "Teacher Demonstration Abacus (Large)", sku: "AB-TCHR-DEMO", stock: 25, minThreshold: 10, cost: 25 },
  { id: 3, name: "Level 1 Workbooks (Set of A & B)", sku: "BK-LVL-1", stock: 85, minThreshold: 150, cost: 8 },
  { id: 4, name: "Level 2 Workbooks (Set of A & B)", sku: "BK-LVL-2", stock: 240, minThreshold: 100, cost: 8 },
  { id: 5, name: "Smart Abacus Academy Bags", sku: "BG-ACAD", stock: 12, minThreshold: 50, cost: 4 },
  { id: 6, name: "Student Graduation Certificates", sku: "CT-GRAD", stock: 600, minThreshold: 200, cost: 1 }
];

// Initial mock system notifications
const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "system", title: "Registration restricted", message: "Public signup bypass disabled for security policy compliance.", time: "10 mins ago", read: false },
  { id: 2, type: "alert", title: "Low stock alert", message: "Workbook Level 1 units fell below minimum alert threshold (150).", time: "2 hours ago", read: false },
  { id: 3, type: "info", title: "New franchise linked", message: "Mumbai West Franchise owner Suresh Deshmukh successfully registered.", time: "3 hours ago", read: true }
];

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
