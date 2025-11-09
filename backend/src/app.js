const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { ensureConnection, isConnected } = require('./config/database');

// Import routes
const thesisRoutes = require('./routes/thesisRoutes');
const searchRoutes = require('./routes/searchRoutes');
const chatRoutes = require('./routes/chatRoutes');

/**
 * Initialize Express App
 */
const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Build allowed origins list
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://ai-powered-repository-clientfe.vercel.app', // Explicitly add frontend URL
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
    ].filter(Boolean);
    
    // Normalize origin (remove trailing slash for comparison)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    // Log for debugging (only in production to avoid spam)
    if (process.env.NODE_ENV === 'production') {
      logger.info(`CORS check - Origin: ${normalizedOrigin}, Allowed: ${normalizedAllowed.join(', ')}`);
    }
    
    if (normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${normalizedOrigin}`);
      // Return false instead of error to properly handle CORS rejection
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with specific origins
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Database connection middleware (for serverless)
// Ensures DB is connected before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    // Skip health check endpoint
    if (req.path === '/health' || req.path === '/') {
      return next();
    }
    
    // Ensure database connection before processing API requests
    if (!isConnected()) {
      logger.info('Database not connected, attempting connection...');
      await ensureConnection();
      logger.info('Database connection ensured');
    }
    next();
  } catch (error) {
    logger.error(`Database connection middleware error: ${error.message}`);
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/theses', thesisRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AI-Powered Thesis Repository API',
    version: '1.0.0',
    endpoints: {
      theses: '/api/theses',
      search: '/api/search',
      chat: '/api/chat',
      health: '/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

