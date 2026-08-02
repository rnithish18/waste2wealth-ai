const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a plain/html email. Throws if SMTP isn't configured or send fails,
 * so callers should catch and decide whether to surface a soft warning
 * (e.g. "account created, but verification email failed to send").
 */
const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Waste2Wealth AI <no-reply@waste2wealth.ai>',
    to,
    subject,
    text,
    html,
  });
};

exports.sendVerificationOTP = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: 'Verify your Waste2Wealth AI account',
    html: `<p>Your email verification OTP is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
    text: `Your verification OTP is ${otp}. It expires in 10 minutes.`,
  });
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  await sendEmail({
    to: email,
    subject: 'Reset your Waste2Wealth AI password',
    html: `<p>You requested a password reset. Click the link below (valid for 10 minutes):</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p>If you didn't request this, please ignore this email.</p>`,
    text: `Reset your password: ${resetUrl} (valid for 10 minutes)`,
  });
};

exports.sendEmail = sendEmail;
