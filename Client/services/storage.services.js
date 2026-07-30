// src/services/storage.services.js

const TOKEN_KEY = 'abacus_auth_token';
const USER_KEY = 'abacus_user_data';

export const storageService = {
  // 1. JWT Access Token Management
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // 2. User Metadata Profile Management
  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      try {
        const parsed = JSON.parse(userStr);
        if (parsed && parsed.email) {
          const savedAvatar = localStorage.getItem(`abacus_avatar_${parsed.email.toLowerCase()}`);
          if (savedAvatar) {
            parsed.profilePhoto = savedAvatar;
          }
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      if (user.email) {
        const emailKey = `abacus_avatar_${user.email.toLowerCase()}`;
        if (user.profilePhoto) {
          localStorage.setItem(emailKey, user.profilePhoto);
        } else if (user.profilePhoto === null) {
          localStorage.removeItem(emailKey);
        } else {
          const savedAvatar = localStorage.getItem(emailKey);
          if (savedAvatar) {
            user.profilePhoto = savedAvatar;
          }
        }
      }
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // 3. Clear Session on Logout / 401 Unauthorized
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
};