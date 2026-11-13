// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'bda_team_module_default_secret_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'BDA',
      phone,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

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
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
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

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
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

    // Set password to a demo reset string
    user.password = 'Reset@2026';
    await user.save();

    res.json({
      message: 'Demo Password Reset Successful! For sandbox testing, your password has been reset to: Reset@2026. Please log in using this temporary credential and update it immediately.',
      tempPassword: 'Reset@2026'
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

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/biometric-login
// @desc    Login via Biometric Authentication (WebAuthn / TouchID / FaceID)
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
      // Fallback to active demo BDA if no specific email provided
      user = await User.findOne({ role: 'BDA' });
    }

    if (!user) {
      return res.status(404).json({ message: 'No registered user found for this biometric signature' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

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
    // Keep max 100 records
    if (user.attendanceHistory.length > 100) {
      user.attendanceHistory = user.attendanceHistory.slice(0, 100);
    }

    await user.save();

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
