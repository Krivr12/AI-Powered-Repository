require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { ensureConnection } = require('./src/config/database');
const aiService = require('./src/services/aiService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Initialize database connection (for Vercel serverless)
let dbConnectionPromise = null;

const initializeDB = async () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = (async () => {
      try {
        await connectDB();
        logger.info('✓ Database connected successfully');
        return true;
      } catch (error) {
        logger.error(`Database connection error: ${error.message}`);
        // Reset promise so we can retry on next request
        dbConnectionPromise = null;
        return false;
      }
    })();
  }
  return dbConnectionPromise;
};

// For Vercel serverless functions
if (process.env.VERCEL) {
  // Initialize DB on cold start (fire and forget, but store promise)
  initializeDB().catch(err => {
    logger.error('Failed to initialize DB on cold start:', err);
  });

  // Export the app as a serverless function handler
  module.exports = app;
} else {
  // For local development - start a traditional server
  const startServer = async () => {
    try {
      // Connect to MongoDB
      await connectDB();
      logger.info('✓ Database connected successfully');

      // Check AI service health
      const aiHealthy = await aiService.checkHealth();
      if (aiHealthy) {
        logger.info('✓ AI service is healthy');
      } else {
        logger.warn('⚠ AI service health check failed - proceeding anyway');
      }

      // Start Express server
      const server = app.listen(PORT, () => {
        logger.info(`✓ Server running in ${process.env.NODE_ENV || 'development'} mode`);
        logger.info(`✓ Server listening on port ${PORT}`);
        logger.info(`✓ API Base URL: http://localhost:${PORT}`);
        logger.info('\n=================================');
        logger.info('Available Endpoints:');
        logger.info('=================================');
        logger.info('POST   /api/theses              - Create thesis');
        logger.info('GET    /api/theses              - Get all theses');
        logger.info('GET    /api/theses/:id          - Get thesis by ID');
        logger.info('GET    /api/theses/tag/:tag     - Get theses by tag');
        logger.info('GET    /api/theses/:id/similar  - Get similar theses');
        logger.info('POST   /api/search/semantic     - Semantic search');
        logger.info('POST   /api/chat                - Chat with AI');
        logger.info('GET    /api/chat/suggestions    - Get suggested questions');
        logger.info('GET    /health                  - Health check');
        logger.info('=================================\n');
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('\nSIGINT signal received: closing HTTP server');
        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      });
    } catch (error) {
      logger.error(`Failed to start server: ${error.message}`);
      process.exit(1);
    }
  };

  // Start the server
  startServer();
}

