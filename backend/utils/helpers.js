// backend/utils/helpers.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Format date
 */
const formatDate = (date) => {
  return date ? date.toISOString().split('T')[0] : 'N/A';
};

/**
 * Calculate conversion rate
 */
const calculateConversionRate = (closedDeals, totalLeads) => {
  if (!totalLeads) return 0;
  return ((closedDeals / totalLeads) * 100).toFixed(2);
};

/**
 * Validate email
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Check if user has permission
 */
const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    Manager: 3,
    TeamLead: 2,
    BDA: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Paginate query results
 */
const paginate = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

/**
 * Build sort object for MongoDB
 */
const buildSort = (sortBy) => {
  if (!sortBy) return { createdAt: -1 };

  const sortParts = sortBy.split(':');
  const field = sortParts[0];
  const order = sortParts[1] === 'asc' ? 1 : -1;

  return { [field]: order };
};

/**
 * Calculate business days between dates
 */
const calculateBusinessDays = (startDate, endDate) => {
  let count = 0;
  const curDate = new Date(startDate);

  while (curDate <= new Date(endDate)) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
};

/**
 * Parse query filters
 */
const parseFilters = (query) => {
  const filters = {};

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  if (query.stage) {
    filters.stage = query.stage;
  }

  if (query.source) {
    filters.source = query.source;
  }

  if (query.industry) {
    filters.industry = query.industry;
  }

  if (query.assignedTo) {
    filters.assignedTo = query.assignedTo;
  }

  if (query.minValue && query.maxValue) {
    filters.dealValue = {
      $gte: parseInt(query.minValue),
      $lte: parseInt(query.maxValue),
    };
  }

  if (query.startDate && query.endDate) {
    filters.createdAt = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate),
    };
  }

  return filters;
};

/**
 * Format API response
 */
const formatResponse = (statusCode, message, data = null) => {
  return {
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Calculate pipeline metrics
 */
const calculatePipelineMetrics = (leads) => {
  const metrics = {
    total: leads.length,
    byStage: {},
    totalValue: 0,
    avgValue: 0,
    avgProbability: 0,
  };

  let totalProbability = 0;

  leads.forEach((lead) => {
    // By stage
    if (!metrics.byStage[lead.stage]) {
      metrics.byStage[lead.stage] = {
        count: 0,
        value: 0,
      };
    }
    metrics.byStage[lead.stage].count++;
    metrics.byStage[lead.stage].value += lead.dealValue;

    // Totals
    metrics.totalValue += lead.dealValue;
    totalProbability += lead.probability;
  });

  // Averages
  if (leads.length > 0) {
    metrics.avgValue = (metrics.totalValue / leads.length).toFixed(2);
    metrics.avgProbability = (totalProbability / leads.length).toFixed(2);
  }

  return metrics;
};

/**
 * Generate CSV from array
 */
const generateCSV = (data, headers) => {
  const headerRow = headers.join(',');
  const dataRows = data.map((item) =>
    headers
      .map((header) => {
        const value = item[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

module.exports = {
  generateToken,
  formatDate,
  calculateConversionRate,
  isValidEmail,
  isValidPhone,
  hasPermission,
  paginate,
  buildSort,
  calculateBusinessDays,
  parseFilters,
  formatResponse,
  calculatePipelineMetrics,
  generateCSV,
};
