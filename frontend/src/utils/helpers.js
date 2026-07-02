// frontend/src/utils/helpers.js
import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return format(parseISO(date), 'MMM dd, yyyy');
  } catch {
    return 'N/A';
  }
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeDate = (date) => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return 'N/A';
  }
};

/**
 * Format currency to USD
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Get random color for avatar
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
  ];
  const index = (name ? name.charCodeAt(0) : 0) % colors.length;
  return colors[index];
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    Manager: 3,
    TeamLead: 2,
    BDA: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Get stage badge color
 */
export const getStageBadgeColor = (stage) => {
  const colors = {
    'Prospecting': 'bg-blue-100 text-blue-700',
    'Qualification': 'bg-purple-100 text-purple-700',
    'Proposal': 'bg-yellow-100 text-yellow-700',
    'Negotiation': 'bg-orange-100 text-orange-700',
    'Closed Won': 'bg-green-100 text-green-700',
    'Closed Lost': 'bg-red-100 text-red-700',
  };

  return colors[stage] || 'bg-gray-100 text-gray-700';
};

/**
 * Parse error message from API response
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An error occurred. Please try again.';
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Calculate conversion rate
 */
export const calculateConversionRate = (closedDeals, totalLeads) => {
  if (!totalLeads) return 0;
  return ((closedDeals / totalLeads) * 100).toFixed(2);
};

/**
 * Get stage progression percentage
 */
export const getStagePercentage = (stage) => {
  const stageMap = {
    'Prospecting': 20,
    'Qualification': 40,
    'Proposal': 60,
    'Negotiation': 80,
    'Closed Won': 100,
    'Closed Lost': 0,
  };

  return stageMap[stage] || 0;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sort array by key
 */
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Filter array by multiple criteria
 */
export const filterByMultipleCriteria = (array, criteria) => {
  return array.filter((item) => {
    return Object.keys(criteria).every((key) => {
      const value = criteria[key];
      if (!value) return true;
      return item[key] == value;
    });
  });
};

/**
 * Group array by key
 */
export const groupByKey = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects
 */
export const mergeObjects = (obj1, obj2) => {
  return { ...obj1, ...obj2 };
};
