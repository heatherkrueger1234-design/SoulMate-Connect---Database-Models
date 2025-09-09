const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalRevenue: { type: Number, required: true, default: 0 },
  ownerAmount: { type: Number, required: true, default: 0 },
  operatingAmount: { type: Number, required: true, default: 0 },
  breakdown: {
    subscriptions: { type: Number, default: 0 },
    premiumFeatures: { type: Number, default: 0 },
    superLikes: { type: Number, default: 0 },
    boosts: { type: Number, default: 0 }
  },
  targetMet: { type: Boolean, default: false },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Revenue', revenueSchema);
