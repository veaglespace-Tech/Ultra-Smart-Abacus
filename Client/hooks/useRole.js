// src/hooks/useRole.js
"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store"; // Assuming Zustand or context path
import { storageService } from "@/services/storage.services";

export function useRole() {
  const [roleState, setRoleState] = useState({
    role: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Accessing layout sync values from global store framework if active
  const storeUser = useAuthStore ? useAuthStore((state) => state.user) : null;
  const storeRole = useAuthStore ? useAuthStore((state) => state.role) : null;

  useEffect(() => {
    function verifyRoleAccess() {
      try {
        // Fallback strategy: If store is empty, verify via central storage token service
        const localUser = storageService.getUser() || null;
        const activeUser = storeUser || localUser;
        const activeRole = storeRole || activeUser?.role || null;

        setRoleState({
          role: activeRole ? activeRole.toUpperCase() : null, // Normalizing roles to 'TEACHER', 'STUDENT', 'FRANCHISE'
          user: activeUser,
          isLoading: false,
          isAuthenticated: !!activeUser && !!activeRole,
        });
      } catch (error) {
        console.error("Critical identity context configuration mismatch:", error);
        setRoleState({
          role: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }

    verifyRoleAccess();
  }, [storeUser, storeRole]);

  // Essential helper utility validations for layouts routing
  return {
    ...roleState,
    isTeacher: roleState.role === "TEACHER",
    isStudent: roleState.role === "STUDENT",
    isFranchise: roleState.role === "FRANCHISE",
  };
}