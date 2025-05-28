const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }]
}, {
  timestamps: true
});

// Index for faster queries
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ status: 1, expiresAt: 1 });

// Method to check if session is expired
sessionSchema.methods.isExpired = function() {
  return this.status === 'expired' || this.expiresAt < new Date();
};

// Static method to find active sessions
sessionSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session; 