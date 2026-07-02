// frontend/src/utils/constants.js
export const LEAD_STAGES = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

export const INDUSTRIES = [
  'Automotive',
  'Textile',
  'Food Processing',
  'Pharmaceuticals',
  'Electronics',
  'Chemicals',
  'Other',
];

export const LEAD_SOURCES = [
  'Cold Call',
  'Email',
  'Referral',
  'Website',
  'Trade Show',
  'Other',
];

export const COMMUNICATION_TYPES = [
  'Call',
  'Email',
  'Meeting',
  'Note',
  'Follow-up',
];

export const USER_ROLES = {
  BDA: 'BDA',
  TEAM_LEAD: 'TeamLead',
  MANAGER: 'Manager',
};

export const STAGE_COLORS = {
  'Prospecting': 'bg-blue-100 text-blue-700',
  'Qualification': 'bg-purple-100 text-purple-700',
  'Proposal': 'bg-yellow-100 text-yellow-700',
  'Negotiation': 'bg-orange-100 text-orange-700',
  'Closed Won': 'bg-green-100 text-green-700',
  'Closed Lost': 'bg-red-100 text-red-700',
};

export const COMMUNICATION_TYPE_ICONS = {
  'Call': 'phone',
  'Email': 'mail',
  'Meeting': 'calendar',
  'Note': 'edit',
  'Follow-up': 'clock',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GET_ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/update-profile',
  },
  LEADS: {
    GET_ALL: '/api/leads',
    CREATE: '/api/leads',
    GET_ONE: '/api/leads/:id',
    UPDATE: '/api/leads/:id',
    DELETE: '/api/leads/:id',
    UPDATE_STAGE: '/api/leads/:id/stage',
    ASSIGN: '/api/leads/:id/assign',
  },
  TEAM: {
    GET_MEMBERS: '/api/team/members',
    CREATE_MEMBER: '/api/team/members',
    GET_MEMBER: '/api/team/members/:id',
    UPDATE_MEMBER: '/api/team/members/:id',
    DELETE_MEMBER: '/api/team/members/:id',
    GET_TEAMS: '/api/team',
    CREATE_TEAM: '/api/team',
    UPDATE_TEAM: '/api/team/:id',
    DELETE_TEAM: '/api/team/:id',
  },
  COMMUNICATIONS: {
    GET_ALL: '/api/communications',
    CREATE: '/api/communications',
    GET_BY_LEAD: '/api/communications/:leadId',
    UPDATE: '/api/communications/:id',
    DELETE: '/api/communications/:id',
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    TEAM_PERFORMANCE: '/api/analytics/team-performance',
    PIPELINE: '/api/analytics/pipeline',
    TRENDS: '/api/analytics/trends',
    EXPORT: '/api/analytics/export',
  },
};

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
