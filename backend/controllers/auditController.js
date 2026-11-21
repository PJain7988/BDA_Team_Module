// backend/controllers/auditController.js
const AuditLog = require('../models/AuditLog');

// @route   GET /api/audit-logs
// @desc    Get audit trail with search, filters & pagination
// @access  Private (Manager only)
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const { action, resource, search, startDate, endDate, userId } = req.query;
    const query = {};

    if (action) {
      query.action = action;
    }

    if (resource) {
      query.resource = resource;
    }

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      logs,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ message: error.message || 'Error fetching audit logs' });
  }
};

// @route   GET /api/audit-logs/stats
// @desc    Get summary security statistics
// @access  Private (Manager only)
exports.getAuditStats = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total24h, logins24h, securityAlerts24h, totalEvents] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      AuditLog.countDocuments({
        createdAt: { $gte: oneDayAgo },
        action: { $in: ['LOGIN', 'LOGIN_WEBAUTHN', 'LOGIN_2FA_SUCCESS'] },
      }),
      AuditLog.countDocuments({
        createdAt: { $gte: oneDayAgo },
        action: { $in: ['LOGIN_FAILED', 'WEBAUTHN_LOGIN_FAILED', 'TOTP_LOGIN_FAILED', 'ACCOUNT_LOCKED'] },
      }),
      AuditLog.countDocuments(),
    ]);

    // Top actions breakdown
    const topActions = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: {
        total24h,
        logins24h,
        securityAlerts24h,
        totalEvents,
        topActions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
