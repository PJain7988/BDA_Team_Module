// backend/models/Communication.js
const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Note', 'Follow-up'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    communicatedWith: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    nextFollowUp: Date,
    attachments: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

// Index for faster queries
communicationSchema.index({ lead: 1, createdAt: -1 });
communicationSchema.index({ nextFollowUp: 1 });

module.exports = mongoose.model('Communication', communicationSchema);
