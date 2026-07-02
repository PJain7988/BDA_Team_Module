// frontend/src/services/teamService.js
import api from './api';

const teamService = {
  getMembers: async () => {
    const response = await api.get('/api/team/members');
    return response.data;
  },

  getMemberById: async (id) => {
    const response = await api.get(`/api/team/members/${id}`);
    return response.data;
  },

  addMember: async (data) => {
    const response = await api.post('/api/team/members', data);
    return response.data;
  },

  updateMember: async (id, data) => {
    const response = await api.put(`/api/team/members/${id}`, data);
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await api.delete(`/api/team/members/${id}`);
    return response.data;
  },

  getTeams: async () => {
    const response = await api.get('/api/team');
    return response.data;
  },

  createTeam: async (data) => {
    const response = await api.post('/api/team', data);
    return response.data;
  },

  updateTeam: async (id, data) => {
    const response = await api.put(`/api/team/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/api/team/${id}`);
    return response.data;
  },

  getTeamPerformance: async () => {
    const response = await api.get('/api/analytics/team-performance');
    return response.data;
  },
};

export default teamService;
