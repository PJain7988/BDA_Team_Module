// frontend/src/redux/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const id = Date.now();
      state.notifications.push({
        ...action.payload,
        id,
      });
      // Auto remove after 5 seconds
      setTimeout(() => {
        state.notifications = state.notifications.filter((n) => n.id !== id);
      }, 5000);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
