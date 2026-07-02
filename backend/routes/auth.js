// backend/routes/auth.js
const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  changePassword,
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/update-profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/logout', auth, logout);

module.exports = router;
