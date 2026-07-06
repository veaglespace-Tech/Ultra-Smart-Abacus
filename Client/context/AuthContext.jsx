"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { login as apiLogin } from "@/services/auth.services";
import { storageService } from "@/services/storage.services";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure, logout as reduxLogout } from "@/store/auth.store";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(() => {
    return storageService.getUser();
  });
  const [loading, setLoading] = useState(false);

  // Sync state on mount
  useEffect(() => {
    const storedUser = storageService.getUser();
    const storedToken = storageService.getToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      dispatch(loginSuccess({ user: storedUser, token: storedToken }));
    }
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const profile = await apiLogin(email, password);
      setUser(profile);
      dispatch(loginSuccess({ user: profile, token: storageService.getToken() }));
      return profile;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    setUser(null);
    storageService.clearAuth();
    dispatch(reduxLogout());
  }, [dispatch]);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};