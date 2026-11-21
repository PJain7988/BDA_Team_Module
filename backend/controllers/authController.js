// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { logAudit } = require('../utils/auditLogger');

// Generate short-lived access token
const generateAccessToken = (id) => {
  const secret = process.env.JWT_SECRET || 'bda_team_module_default_secret_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Generate and record refresh token
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

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'BDA',
      phone,
    });

    await user.save();

    const token = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user, req);
    setRefreshCookie(res, refreshToken);

    await logAudit(req, {
      action: 'USER_REGISTER',
      resource: 'USER',
      resourceId: user._id,
      details: { role: user.role, email: user.email },
      user,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
// @desc    Login user with lockout protection and optional 2FA
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +totpSecret');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockoutUntil - new Date()) / 60000);
      await logAudit(req, {
        action: 'ACCOUNT_LOCKED_ATTEMPT',
        resource: 'AUTH',
        details: { email, waitMinutes },
        user,
      });
      return res.status(423).json({
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${waitMinutes} minute(s).`,
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let isLockedNow = false;

      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
        isLockedNow = true;
      }

      await user.save();

      await logAudit(req, {
        action: isLockedNow ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
        resource: 'AUTH',
        details: { email, failedAttempts: user.failedLoginAttempts },
        user,
      });

      if (isLockedNow) {
        return res.status(423).json({
          message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
        });
      }

      const remainingAttempts = 5 - user.failedLoginAttempts;
      return res.status(401).json({
        message: `Invalid credentials. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
      });
    }

    // Password matches! Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Check if 2FA TOTP is required
    if (user.totpEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, stage: '2fa_required' },
        process.env.JWT_SECRET || 'bda_team_module_default_secret_key_2026',
        { expiresIn: '5m' }
      );

      await logAudit(req, {
        action: '2FA_CHALLENGE_ISSUED',
        resource: 'AUTH',
        details: { email: user.email },
        user,
      });

      return res.json({
        twoFactorRequired: true,
        tempToken,
        message: 'Two-factor authentication code required',
      });
    }

    // Issue tokens
    const token = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user, req);
    setRefreshCookie(res, refreshToken);

    await logAudit(req, {
      action: 'LOGIN_PASSWORD',
      resource: 'AUTH',
      details: { email: user.email, role: user.role },
      user,
    });

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/refresh
// @desc    Rotate refresh token and issue new access token
// @access  Public (Cookie)
exports.refreshToken = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ message: 'Refresh token cookie missing' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'bda_refresh_secret_key_2026_super_secure';
    let decoded;
    try {
      decoded = jwt.verify(rawToken, refreshSecret);
    } catch (err) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ message: 'Refresh token expired or invalid' });
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const existing = await RefreshToken.findOne({
      tokenHash,
      userId: decoded.id,
      revoked: false,
    });

    if (!existing || existing.expiresAt < new Date()) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ message: 'Refresh token revoked or expired' });
    }

    // Mark current refresh token as revoked
    existing.revoked = true;
    await existing.save();

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ message: 'User account disabled or not found' });
    }

    // Generate new access and refresh tokens (rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = await generateRefreshToken(user, req);
    setRefreshCookie(res, newRefreshToken);

    res.json({
      token: newAccessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    await logAudit(req, {
      action: 'UPDATE_PROFILE',
      resource: 'USER',
      resourceId: user._id,
      details: { name, phone },
      user,
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate refresh token
// @access  Public / Private
exports.logout = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (rawToken) {
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await RefreshToken.updateMany({ tokenHash }, { revoked: true });
    }

    res.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    if (req.user) {
      await logAudit(req, {
        action: 'LOGOUT',
        resource: 'AUTH',
        user: req.user,
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Forgot password (Demo Reset)
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    user.password = 'Reset@2026';
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    await logAudit(req, {
      action: 'PASSWORD_RESET_DEMO',
      resource: 'AUTH',
      details: { email },
      user,
    });

    res.json({
      message: 'Demo Password Reset Successful! For sandbox testing, your password has been reset to: Reset@2026. Please log in using this temporary credential and update it immediately.',
      tempPassword: 'Reset@2026',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req, {
      action: 'PASSWORD_CHANGE',
      resource: 'AUTH',
      user,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/biometric-login
// @desc    Biometric login legacy endpoint
// @access  Public
exports.biometricLogin = async (req, res) => {
  try {
    const { email, credentialId } = req.body;

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (credentialId) {
      user = await User.findOne({ biometricCredentialId: credentialId });
    }

    if (!user) {
      user = await User.findOne({ role: 'BDA' });
    }

    if (!user) {
      return res.status(404).json({ message: 'No registered user found for this biometric signature' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user, req);
    setRefreshCookie(res, refreshToken);

    await logAudit(req, {
      action: 'LOGIN_BIOMETRIC_LEGACY',
      resource: 'AUTH',
      user,
    });

    res.json({
      message: 'Biometric verification successful',
      token,
      user: user.toJSON(),
      biometricVerified: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/biometric-register
// @desc    Register or enable biometric credentials for current user
// @access  Private
exports.biometricRegister = async (req, res) => {
  try {
    const { credentialId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.biometricEnabled = true;
    if (credentialId) {
      user.biometricCredentialId = credentialId;
    }
    await user.save();

    res.json({
      message: 'Biometric credentials registered successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/attendance/punch
// @desc    Log biometric attendance (Punch In / Punch Out)
// @access  Private
exports.logAttendance = async (req, res) => {
  try {
    const { punchType = 'in', location, notes } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const punchRecord = {
      punchType,
      timestamp: new Date(),
      biometricVerified: true,
      location: location || {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'BDA Field Office / Client Manufacturing Hub',
      },
      notes: notes || `Biometric ${punchType === 'in' ? 'Check-in' : 'Check-out'} completed`,
    };

    if (!user.attendanceHistory) {
      user.attendanceHistory = [];
    }
    user.attendanceHistory.unshift(punchRecord);
    if (user.attendanceHistory.length > 100) {
      user.attendanceHistory = user.attendanceHistory.slice(0, 100);
    }

    await user.save();

    await logAudit(req, {
      action: punchType === 'in' ? 'ATTENDANCE_PUNCH_IN' : 'ATTENDANCE_PUNCH_OUT',
      resource: 'ATTENDANCE',
      details: { punchType, location: punchRecord.location?.address },
      user,
    });

    res.json({
      message: `Successfully punched ${punchType.toUpperCase()} with biometric verification`,
      record: punchRecord,
      attendanceHistory: user.attendanceHistory.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/attendance/history
// @desc    Get user attendance history
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      attendanceHistory: user.attendanceHistory || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
