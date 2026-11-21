// backend/routes/attendance.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All attendance routes require authentication
router.use(protect);

// Personal BDA Check-in / Check-out routes
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/my-history', attendanceController.getMyHistory);

// Team Lead & Manager Oversight routes
router.get('/team', authorize('TeamLead', 'Manager'), attendanceController.getTeamAttendance);
router.get('/monthly-summary', authorize('TeamLead', 'Manager'), attendanceController.getMonthlySummary);
router.get('/kpi-correlation', authorize('TeamLead', 'Manager'), attendanceController.getKpiCorrelation);
router.get('/export', authorize('TeamLead', 'Manager'), attendanceController.exportAttendance);

module.exports = router;
