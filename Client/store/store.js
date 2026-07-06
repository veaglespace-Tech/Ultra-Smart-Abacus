import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.store';
import userReducer from './user.store';
import franchiseReducer from './franchiseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    franchise: franchiseReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
