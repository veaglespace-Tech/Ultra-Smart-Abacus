"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminData } from "../AdminContext";

function UserManagementContent() {
  const {
    users,
    toggleUserStatus,
    handleDeleteUser,
    handleCreateUser,
    handleEditUser
  } = useAdminData();

  const searchParams = useSearchParams();
  const shouldAdd = searchParams.get("add");

  // Search & Select filter states
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const q = userSearch.toLowerCase();
    return user.name.toLowerCase().includes(q) || 
           user.email.toLowerCase().includes(q) || 
           user.role.toLowerCase().includes(q) ||
           user.location.toLowerCase().includes(q);
  });

  // Select all logic
  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;
  const isSomeSelected = selectedUserIds.length > 0 && !isAllSelected;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkToggleStatus = (targetStatus) => {
    selectedUserIds.forEach(id => {
      const user = users.find(u => u.id === id);
      if (user && user.status !== targetStatus) {
        toggleUserStatus(id);
      }
    });
    setUserSuccess(`Updated status for ${selectedUserIds.length} user(s) to "${targetStatus}".`);
    setTimeout(() => setUserSuccess(""), 4000);
    setSelectedUserIds([]);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedUserIds.length} selected user(s)?`)) {
      for (const id of selectedUserIds) {
        await handleDeleteUser(id);
      }
      setUserSuccess(`Successfully deleted ${selectedUserIds.length} user(s).`);
      setTimeout(() => setUserSuccess(""), 4000);
      setSelectedUserIds([]);
    }
  };

  // New User Form States
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Teacher");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserLocation, setNewUserLocation] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");

  // Edit User Form States
  const [editUser, setEditUser] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("Teacher");
  const [editUserLocation, setEditUserLocation] = useState("");
  const [editUserStatus, setEditUserStatus] = useState("Active");
  const [editUserError, setEditUserError] = useState("");

  // Trigger add modal if query param is set
  useEffect(() => {
    if (shouldAdd === "true") {
      setShowAddUserModal(true);
    }
  }, [shouldAdd]);

  // Create User Handler
  const submitCreateUser = async (e) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setUserError("Please fill in all required fields.");
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      setUserError("A user with this email address already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "Active",
      date: new Date().toISOString().split("T")[0],
      location: newUserLocation || "Not Assigned"
    };

    try {
      await handleCreateUser(newUser);
      
      // Clear Form & Close
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserLocation("");
      setShowAddUserModal(false);
      
      // Flash Success Banner
      setUserSuccess(`Successfully created user "${newUserName}" as ${newUserRole}!`);
      setTimeout(() => setUserSuccess(""), 4000);
    } catch (err) {
      setUserError(err.message || "Failed to create user");
    }
  };

  // Edit User Handler
  const submitEditUser = (e) => {
    e.preventDefault();
    setEditUserError("");
    setUserSuccess("");

    if (!editUserName || !editUserEmail) {
      setEditUserError("Please fill in all required fields.");
      return;
    }

    if (users.some(u => u.id !== editUser.id && u.email.toLowerCase() === editUserEmail.toLowerCase())) {
      setEditUserError("A user with this email address already exists.");
      return;
    }

    const updatedUser = {
      ...editUser,
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      location: editUserLocation || "Not Assigned",
      status: editUserStatus
    };

    handleEditUser(updatedUser);

    const updatedName = editUserName;
    setEditUser(null);
    setUserSuccess(`Successfully updated user "${updatedName}"!`);
    setTimeout(() => setUserSuccess(""), 4000);
  };

  const performDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const u = users.find(x => x.id === userId);
      handleDeleteUser(userId);
      if (u) {
        setUserSuccess(`Successfully deleted user "${u.name}".`);
        setTimeout(() => setUserSuccess(""), 4000);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">USER MANAGEMENT HUB</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Create, edit, suspend or manage certified instructors, regional owners and student profiles.</p>
        </div>
      </div>

      {/* Message Feed Alerts */}
      {userSuccess && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 shadow-inner flex items-center gap-2">
          <span className="text-lg">✔</span>
          <span>{userSuccess}</span>
        </div>
      )}

      {/* Toolbar Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        
        {/* Search Inputs */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users by name, role, email..."
            className="w-full bg-slate-50 dark:bg-slate-950/55 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
          />
        </div>

        {/* Add User Action Trigger Button */}
        <button
          onClick={() => setShowAddUserModal(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-90 text-xs font-bold text-white shadow-md shadow-[#FF6B2B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create User Account
        </button>
      </div>

      {/* Bulk Action Controls Bar */}
      {selectedUserIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 p-3.5 rounded-2xl text-xs">
          <div className="flex items-center gap-2 font-bold text-orange-900 dark:text-orange-300">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">
              {selectedUserIds.length}
            </span>
            <span>User(s) Selected</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkToggleStatus("Active")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-[11px] cursor-pointer"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkToggleStatus("Suspended")}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all text-[11px] cursor-pointer"
            >
              Suspend Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all text-[11px] cursor-pointer"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all text-[11px] cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* USERS LIST TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <th className="pl-6 pr-2 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => { if (input) input.indeterminate = isSomeSelected; }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    title="Select All Users"
                  />
                </th>
                <th className="px-4 py-4">User Details</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Linked Branch / Center</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  let roleBadgeColor = "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
                  if (user.role === "Franchise") roleBadgeColor = "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
                  else if (user.role === "Teacher") roleBadgeColor = "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20";
                  else if (user.role === "Student") roleBadgeColor = "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";

                  const isRowSelected = selectedUserIds.includes(user.id);

                  return (
                    <tr key={user.id} className={`transition-colors ${isRowSelected ? 'bg-orange-50/40 dark:bg-orange-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                      <td className="pl-6 pr-2 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-200 block text-xs">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleBadgeColor}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.location}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            user.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                              : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-250 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                          }`}
                          title="Click to toggle status"
                        >
                          {user.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{user.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => {
                              setEditUser(user);
                              setEditUserName(user.name);
                              setEditUserEmail(user.email);
                              setEditUserRole(user.role);
                              setEditUserLocation(user.location);
                              setEditUserStatus(user.status);
                              setEditUserError("");
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
                            title="Edit User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => performDeleteUser(user.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 transition-all cursor-pointer"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0M10.5 13.5h3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500 font-light">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER CREATION POPUP MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-6">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-bold text-white">Create New User Account</h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setUserError("");
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {userError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[11px] text-red-300 shadow-inner mb-4">
                {userError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submitCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe / Delhi West Center"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. user@abacus.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    System Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Franchise">Franchise Owner</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Location/Branch
                  </label>
                  <input
                    type="text"
                    value={newUserLocation}
                    onChange={(e) => setNewUserLocation(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Password *
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setUserError("");
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-md shadow-[#FF6B2B]/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* USER EDIT POPUP MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-6">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-bold text-white">Edit User Account</h3>
              <button
                onClick={() => {
                  setEditUser(null);
                  setEditUserError("");
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editUserError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[11px] text-red-300 shadow-inner mb-4">
                {editUserError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submitEditUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="e.g. John Doe / Delhi West Center"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="e.g. user@abacus.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    System Role
                  </label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Franchise">Franchise Owner</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Location/Branch
                  </label>
                  <input
                    type="text"
                    value={editUserLocation}
                    onChange={(e) => setEditUserLocation(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Status
                </label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditUser(null);
                    setEditUserError("");
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] text-white shadow-md shadow-[#FF6B2B]/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function UserManagementPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-xs">Loading User Management...</div>}>
      <UserManagementContent />
    </Suspense>
  );
}
