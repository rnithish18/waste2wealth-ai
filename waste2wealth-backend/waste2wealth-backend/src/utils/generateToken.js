const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for a given user id + role.
 */
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Signs a JWT, sets it as an httpOnly cookie, and sends the standard auth response.
 * Also strips sensitive fields from the user object before sending it back.
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const cookieExpiresDays = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  const userSafe = user.toObject ? user.toObject() : { ...user };
  delete userSafe.password;
  delete userSafe.emailVerificationOTP;
  delete userSafe.passwordResetToken;
  delete userSafe.passwordResetExpires;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user: userSafe },
  });
};

module.exports = { signToken, createSendToken };
