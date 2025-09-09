const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  compatibilityScore: { type: Number, required: true, min: 0, max: 100 },
  matchType: { 
    type: String, 
    enum: ['perfect', 'excellent', 'good', 'potential'], 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'mutual', 'rejected', 'expired'],
    default: 'pending'
  },
  user1Action: {
    type: String,
    enum: ['none', 'like', 'pass', 'super_like'],
    default: 'none'
  },
  user2Action: {
    type: String,
    enum: ['none', 'like', 'pass', 'super_like'],
    default: 'none'
  },
  aiAnalysis: {
    strengths: [String],
    potentialChallenges: [String],
    compatibilityBreakdown: {
      emotional: Number,
      intellectual: Number,
      lifestyle: Number,
      values: Number,
      communication: Number
    }
  },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
}, {
  timestamps: true
});

matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Match', matchSchema);
