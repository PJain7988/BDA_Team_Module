// backend/utils/auditLogger.js
const AuditLog = require('../models/AuditLog');

/**
 * Log an audit event to the database
 * @param {Object} req - Express request object (optional)
 * @param {Object} data - Audit details
 * @param {string} data.action - Action identifier (e.g., 'LOGIN', 'LOGOUT', 'WEBAUTHN_REGISTER')
 * @param {string} data.resource - Resource group (e.g., 'AUTH', 'WEBAUTHN', 'LEAD', 'USER')
 * @param {string} [data.resourceId] - ID of affected entity
 * @param {Object} [data.details] - Arbitrary context payload
 * @param {Object} [data.user] - Optional explicit user object override
 */
const logAudit = async (req, { action, resource, resourceId = null, details = {}, user = null }) => {
  try {
    const activeUser = user || (req && req.user ? req.user : null);
    const ipAddress = req
      ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '')
      : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    await AuditLog.create({
      userId: activeUser ? activeUser._id : null,
      userName: activeUser ? activeUser.name : 'System/Anonymous',
      userEmail: activeUser ? activeUser.email : '',
      role: activeUser ? activeUser.role : 'Guest',
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      details,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent).slice(0, 500),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = { logAudit };
