import { createSlice } from '@reduxjs/toolkit';
import { storageService } from '@/services/storage.services';

const initialState = {
  user: typeof window !== 'undefined' ? storageService.getUser() : null,
  token: typeof window !== 'undefined' ? storageService.getToken() : null,
  isAuthenticated: typeof window !== 'undefined' ? !!storageService.getToken() : false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
