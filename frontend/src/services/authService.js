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
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
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

  // ── WebAuthn / Passkeys Endpoints ──────────────────────────────
  getWebAuthnRegistrationOptions: async () => {
    const response = await api.post('/api/auth/webauthn/register/options');
    return response.data;
  },

  verifyWebAuthnRegistration: async (responsePayload, deviceName) => {
    const response = await api.post('/api/auth/webauthn/register/verify', {
      response: responsePayload,
      deviceName,
    });
    return response.data;
  },

  getWebAuthnLoginOptions: async (email = '') => {
    const response = await api.post('/api/auth/webauthn/login/options', { email });
    return response.data;
  },

  verifyWebAuthnLogin: async (responsePayload, email = '') => {
    const response = await api.post('/api/auth/webauthn/login/verify', {
      response: responsePayload,
      email,
    });
    return response.data;
  },

  getWebAuthnCredentials: async () => {
    const response = await api.get('/api/auth/webauthn/credentials');
    return response.data;
  },

  deleteWebAuthnCredential: async (id) => {
    const response = await api.delete(`/api/auth/webauthn/credentials/${id}`);
    return response.data;
  },

  // ── TOTP 2FA Endpoints ─────────────────────────────────────────
  generate2FA: async () => {
    const response = await api.post('/api/auth/2fa/generate');
    return response.data;
  },

  verify2FA: async (token) => {
    const response = await api.post('/api/auth/2fa/verify', { token });
    return response.data;
  },

  disable2FA: async (password) => {
    const response = await api.post('/api/auth/2fa/disable', { password });
    return response.data;
  },

  verify2FALogin: async (tempToken, code) => {
    const response = await api.post('/api/auth/2fa/login-verify', { tempToken, code });
    return response.data;
  },

  // ── Audit Logs Endpoints (Manager only) ────────────────────────
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/api/audit-logs', { params });
    return response.data;
  },

  getAuditStats: async () => {
    const response = await api.get('/api/audit-logs/stats');
    return response.data;
  },

  // ── Legacy Biometric & Attendance ──────────────────────────────
  biometricLogin: async (credentials = {}) => {
    const response = await api.post('/api/auth/biometric-login', credentials);
    return response.data;
  },

  biometricRegister: async (credentialId) => {
    const response = await api.post('/api/auth/biometric-register', { credentialId });
    return response.data;
  },

  logAttendance: async (punchData) => {
    const response = await api.post('/api/auth/attendance/punch', punchData);
    return response.data;
  },

  getAttendanceHistory: async () => {
    const response = await api.get('/api/auth/attendance/history');
    return response.data;
  },
};

export default authService;
