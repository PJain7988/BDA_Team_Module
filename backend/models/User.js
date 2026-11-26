// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['BDA', 'TeamLead', 'Manager', 'Admin'],
      default: 'BDA',
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    faceData: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid phone number'],
    },
    avatar: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: 'Sales',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    biometricEnabled: {
      type: Boolean,
      default: false,
    },
    biometricCredentialId: {
      type: String,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },
    currentChallenge: {
      type: String,
      default: null,
    },
    totpEnabled: {
      type: Boolean,
      default: false,
    },
    totpSecret: {
      type: String,
      default: null,
      select: false,
    },
    backupCodes: [
      {
        codeHash: { type: String, required: true },
        used: { type: Boolean, default: false },
      },
    ],
    attendanceHistory: [
      {
        punchType: { type: String, enum: ['in', 'out'], default: 'in' },
        timestamp: { type: Date, default: Date.now },
        biometricVerified: { type: Boolean, default: true },
        location: {
          latitude: Number,
          longitude: Number,
          address: String,
        },
        notes: String,
      },
    ],
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user data without sensitive security fields
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.totpSecret;
  delete user.currentChallenge;
  delete user.backupCodes;
  return user;
};

module.exports = mongoose.model('User', userSchema);
