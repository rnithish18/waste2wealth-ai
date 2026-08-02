// Catch uncaught synchronous exceptions before anything else loads
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ---- Socket.IO for real-time chat + notifications ----
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Client should emit 'join' with their userId right after connecting,
  // so we can target notifications/messages to their private room.
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`[Socket.IO] Socket ${socket.id} joined room ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

const start = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Waste2Wealth AI API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

// Catch unhandled promise rejections (e.g. failed DB queries not wrapped in catchAsync)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// Graceful shutdown on platform signals (Render/Docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => console.log('Process terminated.'));
});
