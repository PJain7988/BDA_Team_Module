// backend/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Normalized to midnight (UTC start of day) for day-level indexing
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      default: Date.now,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    method: {
      type: String,
      enum: ['biometric', 'manual'],
      default: 'biometric',
    },
    deviceName: {
      type: String,
      default: 'Biometric Authenticator',
    },
    location: {
      latitude: { type: Number, default: 12.9716 },
      longitude: { type: Number, default: 77.5946 },
      address: { type: String, default: 'BDA Hub / Client Site' },
      accuracy: { type: Number, default: 15 },
    },
    checkOutLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      accuracy: Number,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Leave', 'HalfDay'],
      default: 'Present',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    verifiedByWebAuthn: {
      type: Boolean,
      default: true,
    },
    photoSnapshot: {
      type: String,
      default: '',
    },
    punchTimestamp: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
