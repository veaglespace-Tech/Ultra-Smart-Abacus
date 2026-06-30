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

export function AdminDataProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [franchises, setFranchises] = useState(INITIAL_FRANCHISES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState({
    allowPublicRegister: false,
    maintenanceMode: false,
    emailAlerts: true,
    autoApproveFranchise: false
  });

  // Calculate metrics
  const totalStudents = users.filter(u => u.role === "Student" && u.status === "Active").length * 80 + 350;
  const activeFranchisesCount = franchises.filter(f => f.status === "Active").length;
  const activeTeachersCount = users.filter(u => u.role === "Teacher" && u.status === "Active").length;
  const lowStockItemsCount = inventory.filter(item => item.stock <= item.minThreshold).length;

  // Toggle user status
  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === "Active" ? "Suspended" : "Active" };
      }
      return user;
    }));
  };

  // Delete User
  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Create User
  const handleCreateUser = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
  };

  // Edit User
  const handleEditUser = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  // Add Franchise (and corresponding owner user)
  const handleAddFranchise = (newFranchise, newFranchiseUser) => {
    setFranchises(prev => [...prev, newFranchise]);
    setUsers(prev => [newFranchiseUser, ...prev]);
  };

  // Update Inventory Stock (replenish)
  const adjustStock = (itemId, amount) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: Math.max(0, item.stock + amount) };
      }
      return item;
    }));
  };

  // Add notification
  const addNotification = (n) => {
    setNotifications(prev => [n, ...prev]);
  };

  // Mark notification read
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
