// frontend/src/services/authService.js
import api from './api';

const authService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    return await api.post('/api/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/auth/update-profile', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

export default authService;
