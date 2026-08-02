const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    googleId: { type: String, select: false },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format'],
    },
    industryType: { type: String, required: true, trim: true },

    address: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },

    role: {
      type: String,
      enum: ['admin', 'generator', 'buyer'],
      default: 'generator',
    },

    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    certificates: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },

    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }, // admin can gate onboarding if needed

    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Keep legacy lat/lng in sync with GeoJSON location on save, if provided directly
userSchema.virtual('latitude').get(function () {
  return this.location?.coordinates?.[1];
});
userSchema.virtual('longitude').get(function () {
  return this.location?.coordinates?.[0];
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.createEmailOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
