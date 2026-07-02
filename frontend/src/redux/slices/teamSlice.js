// frontend/src/redux/slices/teamSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  teams: [],
  performance: [],
  isLoading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
    setPerformance: (state, action) => {
      state.performance = action.payload;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    updateMember: (state, action) => {
      const index = state.members.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    removeMember: (state, action) => {
      state.members = state.members.filter((m) => m._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMembers,
  setTeams,
  setPerformance,
  addMember,
  updateMember,
  removeMember,
  setLoading,
  setError,
} = teamSlice.actions;
export default teamSlice.reducer;
