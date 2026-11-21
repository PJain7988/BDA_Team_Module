// backend/models/Credential.js
const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    credentialID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    publicKey: {
      type: Buffer,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    transports: [
      {
        type: String,
      },
    ],
    deviceName: {
      type: String,
      default: 'Biometric Authenticator',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Credential', credentialSchema);
