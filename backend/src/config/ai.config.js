const logger = require('../utils/logger');

/**
 * AI Configuration
 * Switches between Ollama (development) and Groq (production)
 */

const AI_CONFIG = {
  development: {
    provider: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2',
    embeddingModel: process.env.OLLAMA_MODEL || 'llama3.2',
  },
  production: {
    provider: 'groq',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.2-90b-text-preview',
    // Note: Groq doesn't have native embedding endpoints, 
    // we'll use text generation to simulate embeddings
  },
};

const getAIConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const config = AI_CONFIG[env];
  
  logger.info(`Using AI provider: ${config.provider} (${env})`);
  
  return config;
};

module.exports = {
  AI_CONFIG,
  getAIConfig,
};

