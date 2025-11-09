const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Check if already connected
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

const connectDB = async () => {
  // If already connected, return existing connection
  if (isConnected()) {
    logger.info('MongoDB already connected');
    return mongoose.connection;
  }

  try {
    // Check if connection is in progress
    if (mongoose.connection.readyState === 2) { // 2 = connecting
      logger.info('MongoDB connection in progress, waiting...');
      // Wait for connection to complete
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    
    // In serverless environment, don't exit process
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw error; // Let the caller handle it
    } else {
      // In local development, exit on error
      process.exit(1);
    }
  }
};

// Ensure connection before operations
const ensureConnection = async () => {
  if (!isConnected()) {
    await connectDB();
  }
  return mongoose.connection;
};

module.exports = connectDB;
module.exports.isConnected = isConnected;
module.exports.ensureConnection = ensureConnection;

