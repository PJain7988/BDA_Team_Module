// frontend/src/services/communicationService.js
import api from './api';

const communicationService = {
  getCommunications: async (params = {}) => {
    const response = await api.get('/api/communications', { params });
    return response.data;
  },

  getLeadCommunications: async (leadId) => {
    const response = await api.get(`/api/communications/${leadId}`);
    return response.data;
  },

  createCommunication: async (data) => {
    const response = await api.post('/api/communications', data);
    return response.data;
  },

  updateCommunication: async (id, data) => {
    const response = await api.put(`/api/communications/${id}`, data);
    return response.data;
  },

  deleteCommunication: async (id) => {
    const response = await api.delete(`/api/communications/${id}`);
    return response.data;
  },
};

export default communicationService;
