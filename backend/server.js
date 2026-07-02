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
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ── Environment Variables ──────────────────────────────────────
dotenv.config();

// ── Express App ────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── WebSocket Server ───────────────────────────────────────────
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  transports: ['websocket', 'polling'],
});

// ── Database Connection ────────────────────────────────────────
connectDB().then(() => {
  const seedDB = require('./utils/seeder');
  seedDB();
}).catch((err) => {
  console.error('❌ Database connection failed:', err.message);
});

// ── Security Middleware ────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ── Compression ────────────────────────────────────────────────
app.use(compression());

// ── Request Logging ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Rate Limiting ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many requests. Please try again after 15 minutes.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many login attempts. Please try again after 15 minutes.' },
});
app.use('/api/', globalLimiter);

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://bda-team-module.vercel.app',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// ── API Information ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'BDA Team Module API',
    version: '1.0.0',
    description: 'Manufacturing Lead Management System REST API',
    status: 'Operational ✅',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health:    `${req.protocol}://${req.get('host')}/api/health`,
      auth:      `${req.protocol}://${req.get('host')}/api/auth`,
      leads:     `${req.protocol}://${req.get('host')}/api/leads`,
      team:      `${req.protocol}://${req.get('host')}/api/team`,
      analytics: `${req.protocol}://${req.get('host')}/api/analytics`,
      comms:     `${req.protocol}://${req.get('host')}/api/communications`,
    },
    links: {
      frontend: 'https://bda-team-module.vercel.app',
      github:   'https://github.com/PJain7988/BDA_Team_Module',
    },
  });
});

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BDA Team Module API is healthy',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    node: process.version,
  });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',           authLimiter, require('./routes/auth'));
app.use('/api/leads',          require('./routes/leads'));
app.use('/api/team',           require('./routes/team'));
app.use('/api/communications', require('./routes/communications'));
app.use('/api/analytics',      require('./routes/analytics'));

// ── 404 + Global Error Handlers ────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Socket.io Events ───────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('lead:created',    (data) => io.emit('lead:created', data));
  socket.on('lead:updated',    (data) => io.emit('lead:updated', data));
  socket.on('lead:staged',     (data) => io.emit('lead:staged', data));
  socket.on('lead:deleted',    (data) => io.emit('lead:deleted', data));
  socket.on('notification:new',(data) => io.emit('notification:new', data));

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
  });
});

// Make io accessible inside route handlers
app.set('io', io);

// ── Start Server (non-serverless only) ─────────────────────────
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀  Server     : http://0.0.0.0:${PORT}`);
    console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌  WebSocket  : active`);
    console.log(`📊  MongoDB    : connecting...`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

// ── Graceful Shutdown ──────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received — shutting down gracefully...');
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('💥  Unhandled Promise Rejection:', reason);
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

module.exports = { app, server, io };
