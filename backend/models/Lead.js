// backend/models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      enum: [
        'Automotive',
        'Textile',
        'Food Processing',
        'Pharmaceuticals',
        'Electronics',
        'Chemicals',
        'Other',
      ],
      default: 'Other',
    },
    dealValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    stage: {
      type: String,
      enum: [
        'Prospecting',
        'Qualification',
        'Proposal',
        'Negotiation',
        'Closed Won',
        'Closed Lost',
      ],
      default: 'Prospecting',
    },
    source: {
      type: String,
      enum: ['Cold Call', 'Email', 'Referral', 'Website', 'Trade Show', 'Other'],
      default: 'Other',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expectedCloseDate: Date,
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    notes: String,
    attachments: [String],
    communications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Communication',
      },
    ],
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
leadSchema.index({ assignedTo: 1, stage: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ companyName: 'text', contactName: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
