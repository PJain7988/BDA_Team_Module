// backend/routes/webauthn.js
const express = require('express');
const router = express.Router();
const webauthnController = require('../controllers/webauthnController');
const { protect } = require('../middleware/auth');

// Public routes for biometric login
router.post('/login/options', webauthnController.getLoginOptions);
router.post('/login/verify', webauthnController.verifyLogin);

// Protected routes for device management
router.post('/register/options', protect, webauthnController.getRegistrationOptions);
router.post('/register/verify', protect, webauthnController.verifyRegistration);
router.get('/credentials', protect, webauthnController.getCredentials);
router.delete('/credentials/:id', protect, webauthnController.deleteCredential);

module.exports = router;
