// backend/routes/analytics.js
const express = require('express');
const {
  getDashboardMetrics,
  getTeamPerformance,
  getPipelineAnalysis,
  getLeadTrends,
  exportAnalytics,
} = require('../controllers/analyticsController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/dashboard', getDashboardMetrics);
router.get('/team-performance', authorize('TeamLead', 'Manager'), getTeamPerformance);
router.get('/pipeline', getPipelineAnalysis);
router.get('/trends', getLeadTrends);
router.get('/export', exportAnalytics);

module.exports = router;
