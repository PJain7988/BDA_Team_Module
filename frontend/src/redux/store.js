// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leadReducer from './slices/leadSlice';
import teamReducer from './slices/teamSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    team: teamReducer,
    notifications: notificationReducer,
  },
});

export default store;
