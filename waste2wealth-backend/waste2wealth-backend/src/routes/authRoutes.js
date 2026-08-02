const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('industryType').trim().notEmpty().withMessage('Industry type is required'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/google', authLimiter, authController.googleLogin);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, authController.forgotPassword);
router.patch(
  '/reset-password/:token',
  [body('password').isLength({ min: 8 })],
  validate,
  authController.resetPassword
);

// Protected
router.get('/me', protect, authController.getMe);
router.post('/verify-email', protect, authController.verifyEmail);
router.post('/resend-otp', protect, authController.resendOTP);
router.patch(
  '/update-password',
  protect,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  authController.updatePassword
);

module.exports = router;
