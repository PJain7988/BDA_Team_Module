// backend/routes/totp.js
const express = require('express');
const router = express.Router();
const totpController = require('../controllers/totpController');
const { protect } = require('../middleware/auth');

// Public route for completing 2FA login
router.post('/login-verify', totpController.verify2FALogin);

// Protected routes for 2FA management
router.post('/generate', protect, totpController.generate2FA);
router.post('/verify', protect, totpController.verify2FA);
router.post('/disable', protect, totpController.disable2FA);

module.exports = router;
