// backend/controllers/webauthnController.js
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Credential = require('../models/Credential');
const RefreshToken = require('../models/RefreshToken');
const { getWebAuthnConfig } = require('../utils/webauthnConfig');
const { logAudit } = require('../utils/auditLogger');

// Generate access token helper
const generateAccessToken = (id) => {
  const secret = process.env.JWT_SECRET || 'bda_team_module_default_secret_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Generate refresh token helper
const generateRefreshToken = async (user, req) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'bda_refresh_secret_key_2026_super_secure';
  const rawToken = jwt.sign({ id: user._id, type: 'refresh' }, refreshSecret, {
    expiresIn: '7d',
  });

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    userAgent: req ? req.headers['user-agent'] : '',
    ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '') : '',
  });

  return rawToken;
};

// Set refresh cookie helper
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// @route   POST /api/auth/webauthn/register/options
// @desc    Generate WebAuthn registration options for logged-in user
// @access  Private
exports.getRegistrationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { rpName, rpID } = getWebAuthnConfig(req);

    // Get existing credentials to exclude
    const userCredentials = await Credential.find({ userId: user._id });
    const excludeCredentials = userCredentials.map((cred) => ({
      id: cred.credentialID,
      transports: cred.transports || [],
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user._id.toString())),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Save challenge to user
    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (error) {
    console.error('Registration options error:', error);
    res.status(500).json({ message: error.message || 'Error generating registration options' });
  }
};

// @route   POST /api/auth/webauthn/register/verify
// @desc    Verify WebAuthn registration response and save credential
// @access  Private
exports.verifyRegistration = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.currentChallenge) {
      return res.status(400).json({ message: 'Registration challenge expired or missing' });
    }

    const { response, deviceName } = req.body;
    if (!response) {
      return res.status(400).json({ message: 'Missing authenticator registration response' });
    }

    const { rpID, origin } = getWebAuthnConfig(req);

    // Handle origin matching (can be single or allowed list)
    const expectedOrigins = [
      origin,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://bda-team-module.vercel.app',
      process.env.WEBAUTHN_ORIGIN,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ verified: false, message: 'WebAuthn verification failed' });
    }

    const { credential } = verification.registrationInfo;

    // Save credential
    const newCred = await Credential.create({
      userId: user._id,
      credentialID: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports || response.response?.transports || [],
      deviceName: deviceName || 'Biometric Authenticator',
    });

    // Enable biometric on user profile
    user.biometricEnabled = true;
    user.biometricCredentialId = credential.id;
    user.currentChallenge = null;
    await user.save();

    await logAudit(req, {
      action: 'WEBAUTHN_REGISTER',
      resource: 'SECURITY',
      resourceId: newCred._id,
      details: {
        deviceName: newCred.deviceName,
        credentialID: credential.id.slice(0, 16) + '...',
      },
      user,
    });

    res.status(201).json({
      verified: true,
      message: 'Biometric passkey registered successfully!',
      credential: {
        id: newCred._id,
        deviceName: newCred.deviceName,
        createdAt: newCred.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration verify error:', error);
    res.status(400).json({ verified: false, message: error.message || 'Verification failed' });
  }
};

// @route   POST /api/auth/webauthn/login/options
// @desc    Generate WebAuthn login assertion options
// @access  Public
exports.getLoginOptions = async (req, res) => {
  try {
    const { email } = req.body;
    const { rpID } = getWebAuthnConfig(req);

    let allowCredentials = undefined;
    let user = null;

    if (email) {
      user = await User.findOne({ email });
      if (user) {
        const credentials = await Credential.find({ userId: user._id });
        if (credentials.length > 0) {
          allowCredentials = credentials.map((cred) => ({
            id: cred.credentialID,
            transports: cred.transports || [],
          }));
        }
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    if (user) {
      user.currentChallenge = options.challenge;
      await user.save();
    } else {
      // For discoverable credentials or general login
      req.app.locals.latestWebAuthnChallenge = options.challenge;
    }

    res.json(options);
  } catch (error) {
    console.error('Login options error:', error);
    res.status(500).json({ message: error.message || 'Error generating login options' });
  }
};

// @route   POST /api/auth/webauthn/login/verify
// @desc    Verify WebAuthn login assertion and authenticate user
// @access  Public
exports.verifyLogin = async (req, res) => {
  try {
    const { response, email } = req.body;
    if (!response || !response.id) {
      return res.status(400).json({ message: 'Invalid authentication response' });
    }

    // Find credential in database
    const credential = await Credential.findOne({ credentialID: response.id });
    if (!credential) {
      return res.status(404).json({ message: 'No registered biometric passkey found for this device' });
    }

    // Find associated user
    const user = await User.findById(credential.userId);
    if (!user) {
      return res.status(404).json({ message: 'User associated with credential not found' });
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockoutUntil - new Date()) / 60000);
      return res.status(423).json({
        message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${waitMinutes} minute(s).`,
      });
    }

    const { rpID, origin } = getWebAuthnConfig(req);
    const expectedOrigins = [
      origin,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://bda-team-module.vercel.app',
      process.env.WEBAUTHN_ORIGIN,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    const expectedChallenge = user.currentChallenge || req.app.locals.latestWebAuthnChallenge;

    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge expired or missing. Please try again.' });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialID,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      },
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.authenticationInfo) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();

      await logAudit(req, {
        action: 'WEBAUTHN_LOGIN_FAILED',
        resource: 'AUTH',
        details: { reason: 'Signature verification failed' },
        user,
      });

      return res.status(401).json({ verified: false, message: 'Biometric verification failed' });
    }

    // Update credential counter and last used timestamp
    credential.counter = verification.authenticationInfo.newCounter;
    credential.lastUsedAt = new Date();
    await credential.save();

    // Reset lockout counters and set last login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.currentChallenge = null;
    user.lastLogin = new Date();
    await user.save();

    // If TOTP 2FA is enabled, require 2FA verification step
    if (user.totpEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, stage: '2fa_required' },
        process.env.JWT_SECRET || 'bda_team_module_default_secret_key_2026',
        { expiresIn: '5m' }
      );
      return res.json({
        twoFactorRequired: true,
        tempToken,
        message: 'Two-factor authentication code required',
      });
    }

    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user, req);
    setRefreshCookie(res, refreshToken);

    await logAudit(req, {
      action: 'LOGIN_WEBAUTHN',
      resource: 'AUTH',
      details: {
        credentialID: credential.credentialID.slice(0, 16) + '...',
        deviceName: credential.deviceName,
      },
      user,
    });

    res.json({
      verified: true,
      message: 'Biometric authentication successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(400).json({ verified: false, message: error.message || 'Biometric authentication failed' });
  }
};

// @route   GET /api/auth/webauthn/credentials
// @desc    Get user's registered passkeys
// @access  Private
exports.getCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ userId: req.user._id })
      .select('-publicKey')
      .sort({ createdAt: -1 });

    res.json({
      count: credentials.length,
      credentials: credentials.map((cred) => ({
        id: cred._id,
        credentialID: cred.credentialID,
        deviceName: cred.deviceName,
        createdAt: cred.createdAt,
        lastUsedAt: cred.lastUsedAt,
        transports: cred.transports,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/auth/webauthn/credentials/:id
// @desc    Delete/Revoke a registered passkey
// @access  Private
exports.deleteCredential = async (req, res) => {
  try {
    const cred = await Credential.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!cred) {
      return res.status(404).json({ message: 'Passkey not found or unauthorized' });
    }

    const deviceName = cred.deviceName;
    await Credential.deleteOne({ _id: cred._id });

    // Check if user has any remaining credentials
    const remaining = await Credential.countDocuments({ userId: req.user._id });
    if (remaining === 0) {
      await User.findByIdAndUpdate(req.user._id, {
        biometricEnabled: false,
        biometricCredentialId: null,
      });
    }

    await logAudit(req, {
      action: 'WEBAUTHN_DELETE',
      resource: 'SECURITY',
      resourceId: cred._id,
      details: { deviceName },
    });

    res.json({ message: 'Passkey removed successfully', remaining });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
