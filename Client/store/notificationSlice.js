import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';

function deduplicateNotifications(list) {
  if (!Array.isArray(list)) return [];
  const map = new Map();
  list.forEach(item => {
    if (item && item.id != null) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (role, { rejectWithValue }) => {
    try {
      const response = await api.notifications.getForRole(role);
      const list = response.notifications || response.data || [];

      const mapped = list.map(n => ({
        ...n,
        isRead: Boolean(n.isRead === true || n.isRead === 1 || n.isRead === "1" || n.isRead === "true")
      }));

      const notifications = deduplicateNotifications(mapped);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.notifications.markRead(id);
      return id;
    } catch (error) {
      return id;
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.notifications.markAllRead();
      return true;
    } catch (error) {
      return true;
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotifications: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [action.payload];
      const combined = [...state.notifications, ...incoming];
      const unique = deduplicateNotifications(combined);
      state.notifications = unique;
      state.unreadCount = unique.filter(n => !n.isRead).length;
    },
    markReadOptimistic: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadOptimistic: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotifications, markReadOptimistic, markAllReadOptimistic } = notificationSlice.actions;
export default notificationSlice.reducer;
