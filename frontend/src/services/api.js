// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? 'https://bda-team-module-82s1.onrender.com' 
    : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send httpOnly refresh token cookies
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle response errors and silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh attempt for auth routes to prevent loops
    if (
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/refresh') ||
      originalRequest?.url?.includes('/api/auth/2fa/login-verify')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data?.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          if (refreshResponse.data.user) {
            localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
          }
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
