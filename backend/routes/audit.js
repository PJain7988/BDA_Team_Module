// backend/routes/audit.js
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// Manager-only routes for system compliance and security audit logs
router.get('/', protect, authorize('Manager'), auditController.getAuditLogs);
router.get('/stats', protect, authorize('Manager'), auditController.getAuditStats);

module.exports = router;
