const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const aiRoutes = require('./routes/aiRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const buyerRequestRoutes = require('./routes/buyerRequestRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// ---- Security & core middleware ----
app.set('trust proxy', 1); // needed on Render/behind a proxy for correct rate-limit IPs & secure cookies

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . operators from req.body/query/params
app.use(xss()); // sanitizes user input from malicious HTML/JS
app.use(hpp()); // prevents HTTP parameter pollution

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api', apiLimiter);

// ---- Health check ----
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Waste2Wealth AI API is running.', timestamp: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/buyer-requests', buyerRequestRoutes);
app.use('/api/uploads', uploadRoutes);

// ---- 404 handler ----
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

// ---- Global error handler (must be last) ----
app.use(errorHandler);

module.exports = app;
