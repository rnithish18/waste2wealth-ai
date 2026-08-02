const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { createSendToken } = require('../utils/generateToken');
const { sendVerificationOTP, sendPasswordResetEmail } = require('../utils/email');

// POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const {
    companyName, email, password, gstNumber, industryType,
    address, state, city, latitude, longitude, role, phone,
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return next(new AppError('An account with this email already exists.', 409));

  const user = await User.create({
    companyName, email, password, gstNumber, industryType,
    address, state, city, phone,
    role: ['admin'].includes(role) ? 'generator' : (role || 'generator'), // block self-registering as admin
    location: latitude && longitude ? { type: 'Point', coordinates: [longitude, latitude] } : undefined,
  });

  const otp = user.createEmailOTP();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationOTP(user.email, otp);
  } catch (err) {
    console.error('[Email] Failed to send verification OTP:', err.message);
    // Don't block registration on email failure; user can request a resend
  }

  createSendToken(user, 201, res);
});

// POST /api/auth/verify-email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) return next(new AppError('OTP is required.', 400));

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    _id: req.user._id,
    emailVerificationOTP: hashedOTP,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationOTP +emailVerificationExpires');

  if (!user) return next(new AppError('OTP is invalid or has expired.', 400));

  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully.' });
});

// POST /api/auth/resend-otp
exports.resendOTP = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.isEmailVerified) return next(new AppError('Email is already verified.', 400));

  const otp = user.createEmailOTP();
  await user.save({ validateBeforeSave: false });
  await sendVerificationOTP(user.email, otp);

  res.status(200).json({ success: true, message: 'OTP resent. Check your email.' });
});

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password are required.', 400));

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) return next(new AppError('This account has been deactivated.', 403));

  createSendToken(user, 200, res);
});

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// POST /api/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  // Respond identically whether or not the user exists, to avoid account enumeration
  const genericMsg = 'If an account with that email exists, a reset link has been sent.';

  if (!user) return res.status(200).json({ success: true, message: genericMsg });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send reset email. Please try again later.', 500));
  }

  res.status(200).json({ success: true, message: genericMsg });
});

// PATCH /api/auth/reset-password/:token
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired.', 400));
  if (!req.body.password) return next(new AppError('New password is required.', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// POST /api/auth/google
// Expects an id_token verified client-side via Google Identity Services,
// then decodes/validates it here using google-auth-library pattern.
// To keep this module dependency-light and swappable, we verify via Google's tokeninfo endpoint.
exports.googleLogin = catchAsync(async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) return next(new AppError('Google idToken is required.', 400));

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) return next(new AppError('Invalid Google token.', 401));

  const payload = await response.json();

  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    return next(new AppError('Google token audience mismatch.', 401));
  }

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      companyName: payload.name || payload.email.split('@')[0],
      email: payload.email,
      password: crypto.randomBytes(16).toString('hex'), // unusable random password; login stays via Google
      googleId: payload.sub,
      authProvider: 'google',
      industryType: 'Unspecified',
      isEmailVerified: payload.email_verified === 'true' || payload.email_verified === true,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.authProvider = 'google';
    await user.save({ validateBeforeSave: false });
  }

  createSendToken(user, 200, res);
});

// GET /api/auth/me
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

// PATCH /api/auth/update-password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  createSendToken(user, 200, res);
});
