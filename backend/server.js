// backend/server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Connect to MongoDB
connectDB().then(() => {
  const seedDB = require('./utils/seeder');
  seedDB();
});

// Security & Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles and script executions for React frontend
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());

// Logger Middleware
app.use(morgan('dev'));

// Rate Limiter to prevent DOS/Brute-force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

const allowedOrigins = [
  'http://localhost:3000',
  'https://bda-team-module.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/team', require('./routes/team'));
app.use('/api/communications', require('./routes/communications'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Socket.io real-time events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Lead events
  socket.on('lead:created', (data) => {
    io.emit('lead:created', data);
  });

  socket.on('lead:updated', (data) => {
    io.emit('lead:updated', data);
  });

  socket.on('lead:staged', (data) => {
    io.emit('lead:staged', data);
  });

  // Notification events
  socket.on('notification:new', (data) => {
    io.emit('notification:new', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Database connected`);
    console.log(`🔌 WebSocket server active\n`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
