// backend/utils/constants.js
module.exports = {
  // Lead stages
  LEAD_STAGES: [
    'Prospecting',
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ],

  // Industries
  INDUSTRIES: [
    'Automotive',
    'Textile',
    'Food Processing',
    'Pharmaceuticals',
    'Electronics',
    'Chemicals',
    'Other',
  ],

  // Lead sources
  LEAD_SOURCES: [
    'Cold Call',
    'Email',
    'Referral',
    'Website',
    'Trade Show',
    'Other',
  ],

  // Communication types
  COMMUNICATION_TYPES: [
    'Call',
    'Email',
    'Meeting',
    'Note',
    'Follow-up',
  ],

  // User roles
  USER_ROLES: {
    BDA: 'BDA',
    TEAM_LEAD: 'TeamLead',
    MANAGER: 'Manager',
  },

  // JWT expiration
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // Pagination
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,

  // Error messages
  ERRORS: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden access',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
  },

  // Success messages
  SUCCESS: {
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
  },
};
