// frontend/src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

export const { setUser, clearAuth, setLoading, setError, updateUser } = authSlice.actions;
export default authSlice.reducer;
