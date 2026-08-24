import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.store';
import userReducer from './user.store';
import franchiseReducer from './franchiseSlice';
import notificationReducer from './notificationSlice';
import inventoryReducer from './inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    franchise: franchiseReducer,
    notification: notificationReducer,
    inventory: inventoryReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
