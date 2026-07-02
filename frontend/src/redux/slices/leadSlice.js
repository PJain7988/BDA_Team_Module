// frontend/src/redux/slices/leadSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leads: [],
  filteredLeads: [],
  selectedLead: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  },
  filters: {
    stage: '',
    search: '',
    assignedTo: '',
    sortBy: 'createdAt',
  },
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload.leads;
      state.pagination = action.payload.pagination;
    },
    addLead: (state, action) => {
      state.leads.unshift(action.payload);
    },
    updateLead: (state, action) => {
      const index = state.leads.findIndex((lead) => lead._id === action.payload._id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
      if (state.selectedLead?._id === action.payload._id) {
        state.selectedLead = action.payload;
      }
    },
    deleteLead: (state, action) => {
      state.leads = state.leads.filter((lead) => lead._id !== action.payload);
    },
    setSelectedLead: (state, action) => {
      state.selectedLead = action.payload;
    },
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
});

export const {
  setLeads,
  addLead,
  updateLead,
  deleteLead,
  setSelectedLead,
  clearSelectedLead,
  setFilters,
  setLoading,
  setError,
  setPage,
} = leadSlice.actions;
export default leadSlice.reducer;
