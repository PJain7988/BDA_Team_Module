// backend/routes/auth.js
const express = require('express');
const {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  changePassword,
  biometricLogin,
  biometricRegister,
  logAttendance,
  getAttendanceHistory,
  verifyScan,
} = require('../controllers/authController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/verify-scan', optionalAuth, verifyScan);
router.post('/biometric-login', biometricLogin);
router.post('/biometric-register', auth, biometricRegister);
router.post('/attendance/punch', auth, logAttendance);
router.get('/attendance/history', auth, getAttendanceHistory);
router.get('/me', auth, getMe);
router.put('/update-profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/logout', logout);

module.exports = router;
