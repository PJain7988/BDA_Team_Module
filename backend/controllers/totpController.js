// backend/controllers/totpController.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
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
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// @route   POST /api/auth/2fa/generate
// @desc    Generate TOTP secret and QR code for authenticated user
// @access  Private
exports.generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const issuer = process.env.TOTP_ISSUER || 'BDA Manufacturing CRM';
    const secret = speakeasy.generateSecret({
      name: `${issuer} (${user.email})`,
      issuer,
      length: 20,
    });

    // Generate QR Code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate 8 alphanumeric backup codes (formatted as XXXX-XXXX)
    const rawBackupCodes = [];
    const hashedBackupCodes = [];

    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
      rawBackupCodes.push(formatted);
      const salt = await bcrypt.genSalt(10);
      const codeHash = await bcrypt.hash(formatted, salt);
      hashedBackupCodes.push({ codeHash, used: false });
    }

    // Save pending secret & backup codes temporarily
    user.totpSecret = secret.base32;
    user.backupCodes = hashedBackupCodes;
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      backupCodes: rawBackupCodes,
    });
  } catch (error) {
    console.error('2FA generate error:', error);
    res.status(500).json({ message: error.message || 'Error generating 2FA' });
  }
};

// @route   POST /api/auth/2fa/verify
// @desc    Verify code and activate 2FA
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Please provide a 6-digit verification code' });
    }

    const user = await User.findById(req.user._id).select('+totpSecret');
    if (!user || !user.totpSecret) {
      return res.status(400).json({ message: '2FA setup not initialized' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: token.trim(),
      window: 1, // Allow 30s clock drift
    });

    if (!verified) {
      return res.status(400).json({ verified: false, message: 'Invalid 6-digit verification code' });
    }

    user.totpEnabled = true;
    await user.save();

    await logAudit(req, {
      action: 'TOTP_ENABLE',
      resource: 'SECURITY',
      details: { email: user.email },
      user,
    });

    res.json({
      verified: true,
      message: 'Two-Factor Authentication successfully enabled!',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: error.message || 'Error verifying 2FA' });
  }
};

// @route   POST /api/auth/2fa/disable
// @desc    Disable 2FA with password confirmation
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Please provide your current password to disable 2FA' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.totpEnabled = false;
    user.totpSecret = null;
    user.backupCodes = [];
    await user.save();

    await logAudit(req, {
      action: 'TOTP_DISABLE',
      resource: 'SECURITY',
      details: { email: user.email },
      user,
    });

    res.json({ message: 'Two-Factor Authentication disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/2fa/login-verify
// @desc    Validate 2FA code or backup code during login challenge
// @access  Public
exports.verify2FALogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ message: 'Missing token or verification code' });
    }

    // Verify tempToken
    let decoded;
    try {
      decoded = jwt.verify(
        tempToken,
        process.env.JWT_SECRET || 'bda_team_module_default_secret_key_2026'
      );
    } catch (err) {
      return res.status(401).json({ message: '2FA session expired. Please sign in again.' });
    }

    if (decoded.stage !== '2fa_required') {
      return res.status(400).json({ message: 'Invalid 2FA session' });
    }

    const user = await User.findById(decoded.id).select('+totpSecret');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trimmedCode = code.trim().toUpperCase();
    let codeValid = false;

    // Check TOTP code
    if (trimmedCode.length === 6 && /^\d+$/.test(trimmedCode)) {
      codeValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: trimmedCode,
        window: 1,
      });
    }

    // Check backup codes if TOTP failed or user entered formatted backup code
    if (!codeValid && user.backupCodes && user.backupCodes.length > 0) {
      for (const item of user.backupCodes) {
        if (!item.used) {
          const match = await bcrypt.compare(trimmedCode, item.codeHash);
          if (match) {
            codeValid = true;
            item.used = true;
            await user.save();
            break;
          }
        }
      }
    }

    if (!codeValid) {
      await logAudit(req, {
        action: 'TOTP_LOGIN_FAILED',
        resource: 'AUTH',
        details: { email: user.email },
        user,
      });
      return res.status(401).json({ message: 'Invalid 2FA authentication code or backup code' });
    }

    // Success: reset counters, issue tokens
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user, req);
    setRefreshCookie(res, refreshToken);

    await logAudit(req, {
      action: 'LOGIN_2FA_SUCCESS',
      resource: 'AUTH',
      details: { email: user.email },
      user,
    });

    res.json({
      message: '2FA authentication successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('2FA login verify error:', error);
    res.status(500).json({ message: error.message || 'Error verifying 2FA code' });
  }
};
