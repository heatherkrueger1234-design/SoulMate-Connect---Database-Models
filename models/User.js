const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const personalityTraitSchema = new mongoose.Schema({
  openness: { type: Number, min: 0, max: 100, required: true },
  conscientiousness: { type: Number, min: 0, max: 100, required: true },
  extraversion: { type: Number, min: 0, max: 100, required: true },
  agreeableness: { type: Number, min: 0, max: 100, required: true },
  neuroticism: { type: Number, min: 0, max: 100, required: true },
  emotionalIntelligence: { type: Number, min: 0, max: 100, required: true },
  communicationStyle: { 
    type: String, 
    enum: ['direct', 'indirect', 'assertive', 'passive', 'analytical', 'emotional'],
    required: true 
  },
  conflictResolution: {
    type: String,
    enum: ['confrontational', 'avoidant', 'collaborative', 'competitive', 'accommodating'],
    required: true
  },
  loveLanguage: {
    type: [String],
    enum: ['words_of_affirmation', 'quality_time', 'physical_touch', 'acts_of_service', 'receiving_gifts'],
    required: true
  },
  attachmentStyle: {
    type: String,
    enum: ['secure', 'anxious', 'avoidant', 'disorganized'],
    required: true
  }
});

const dealBreakerSchema = new mongoose.Schema({
  smoking: { type: Boolean, default: false },
  drinking: { type: String, enum: ['never', 'occasionally', 'regularly', 'frequently'], default: 'occasionally' },
  children: { type: String, enum: ['none', 'want_some', 'have_some', 'want_more', 'dont_want'], required: true },
  pets: { type: Boolean, default: false },
  religion: { type: String, required: false },
  politics: { type: String, enum: ['liberal', 'conservative', 'moderate', 'apolitical'], required: false },
  exercise: { type: String, enum: ['never', 'rarely', 'sometimes', 'regularly', 'daily'], required: true },
  education: { type: String, enum: ['high_school', 'some_college', 'bachelors', 'masters', 'doctorate'], required: true }
});

const subscriptionSchema = new mongoose.Schema({
  plan: { 
    type: String, 
    enum: ['free', 'premium', 'premium_plus'], 
    default: 'premium' // First 1000 users get premium
  },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String }
});

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'non-binary'], required: true },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'US' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Verification
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isIdVerified: { type: Boolean, default: false },
  isFaceVerified: { type: Boolean, default: false },
  phoneNumber: { type: String },
  
  // Profile
  photos: [{
    url: String,
    isMain: { type: Boolean, default: false },
    uploadDate: { type: Date, default: Date.now }
  }],
  bio: { type: String, maxlength: 500 },
  height: { type: Number }, // in inches
  education: { type: String },
  occupation: { type: String },
  
  // Personality & Compatibility
  personalityTraits: personalityTraitSchema,
  dealBreakers: dealBreakerSchema,
  compatibilityScore: { type: Number, default: 0 },
  personalityType: { type: String }, // MBTI or custom type
  
  // Preferences
  lookingFor: {
    ageRange: {
      min: { type: Number, min: 18, max: 100 },
      max: { type: Number, min: 18, max: 100 }
    },
    maxDistance: { type: Number, default: 50 }, // miles
    gender: [{ type: String, enum: ['male', 'female', 'non-binary'] }]
  },
  
  // Subscription & Revenue
  subscription: subscriptionSchema,
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  
  // Activity & Safety
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  reportCount: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  
  // AI Insights
  aiInsights: {
    compatibilityOdds: { type: String },
    relationshipTips: [String],
    conversationStarters: [String],
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Analytics
  profileViews: { type: Number, default: 0 },
  likesReceived: { type: Number, default: 0 },
  messagesSent: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate referral code
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
