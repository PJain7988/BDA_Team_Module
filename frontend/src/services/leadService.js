// frontend/src/services/leadService.js
import api from './api';

const leadService = {
  getLeads: async (params = {}) => {
    const response = await api.get('/api/leads', { params });
    return response.data;
  },

  getLeadById: async (id) => {
    const response = await api.get(`/api/leads/${id}`);
    return response.data;
  },

  createLead: async (data) => {
    const response = await api.post('/api/leads', data);
    return response.data;
  },

  updateLead: async (id, data) => {
    const response = await api.put(`/api/leads/${id}`, data);
    return response.data;
  },

  updateLeadStage: async (id, stage) => {
    const response = await api.patch(`/api/leads/${id}/stage`, { stage });
    return response.data;
  },

  deleteLead: async (id) => {
    const response = await api.delete(`/api/leads/${id}`);
    return response.data;
  },

  assignLead: async (id, userId) => {
    const response = await api.post(`/api/leads/${id}/assign`, { userId });
    return response.data;
  },
};

export default leadService;
