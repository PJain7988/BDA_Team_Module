// frontend/src/services/attendanceService.js
import api from './api';

const attendanceService = {
  checkIn: async (punchData = {}) => {
    const response = await api.post('/api/attendance/check-in', punchData);
    return response.data;
  },

  checkOut: async (punchData = {}) => {
    const response = await api.post('/api/attendance/check-out', punchData);
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/api/attendance/today');
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/api/attendance/my-history');
    return response.data;
  },

  getTeamAttendance: async (params = {}) => {
    const response = await api.get('/api/attendance/team', { params });
    return response.data;
  },

  getMonthlySummary: async (params = {}) => {
    const response = await api.get('/api/attendance/monthly-summary', { params });
    return response.data;
  },

  getKpiCorrelation: async () => {
    const response = await api.get('/api/attendance/kpi-correlation');
    return response.data;
  },

  exportAttendanceCSV: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/api/attendance/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default attendanceService;
