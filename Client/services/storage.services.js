// src/services/storage.services.js

const TOKEN_KEY = 'abacus_auth_token';
const USER_KEY = 'abacus_user_data';

export const storageService = {
  // Generic Storage Helpers
  get: (key) => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    }
    return null;
  },
  set: (key, val) => {
    if (typeof window !== 'undefined') {
      try {
        const str = typeof val === 'object' ? JSON.stringify(val) : val;
        localStorage.setItem(key, str);
      } catch (e) {}
    }
  },
  // 1. JWT Access Token Management
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {}
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
          try {
            const savedAvatar = localStorage.getItem(`abacus_avatar_${parsed.email.toLowerCase()}`);
            if (savedAvatar) {
              parsed.profilePhoto = savedAvatar;
            }
          } catch (e) {}
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
      try {
        if (user.email) {
          const emailKey = `abacus_avatar_${user.email.toLowerCase()}`;
          if (user.profilePhoto) {
            try {
              localStorage.setItem(emailKey, user.profilePhoto);
            } catch (e) {
              console.warn("Storage quota exceeded for profile avatar:", e);
            }
          } else if (user.profilePhoto === null) {
            try {
              localStorage.removeItem(emailKey);
            } catch (e) {}
          } else {
            try {
              const savedAvatar = localStorage.getItem(emailKey);
              if (savedAvatar) {
                user.profilePhoto = savedAvatar;
              }
            } catch (e) {}
          }
        }

        // Lightweight copy without heavy base64 dataUrls to avoid exceeding 5MB localStorage quota
        const cleanUser = { ...user };
        if (cleanUser.documents && typeof cleanUser.documents === 'object') {
          const lightDocs = {};
          Object.keys(cleanUser.documents).forEach(k => {
            const doc = cleanUser.documents[k];
            if (doc && typeof doc === 'object') {
              lightDocs[k] = {
                name: doc.name,
                type: doc.type,
                size: doc.size,
                uploadedAt: doc.uploadedAt,
              };
            } else {
              lightDocs[k] = doc;
            }
          });
          cleanUser.documents = lightDocs;
        }

        localStorage.setItem(USER_KEY, JSON.stringify(cleanUser));
      } catch (err) {
        console.warn("Storage quota exceeded in setUser:", err);
      }
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