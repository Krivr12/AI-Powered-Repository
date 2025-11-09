const axios = require('axios');
const Groq = require('groq-sdk');
const { getAIConfig } = require('../config/ai.config');
const logger = require('../utils/logger');

/**
 * AI Service - Handles communication with LLAMA models
 * Switches between Ollama (dev) and Groq (prod)
 */

class AIService {
  constructor() {
    this.config = getAIConfig();
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    if (this.config.provider === 'ollama') {
      // Normalize baseUrl to use IPv4 (127.0.0.1) instead of localhost to avoid IPv6 issues
      let baseURL = this.config.baseUrl;
      if (baseURL.includes('localhost')) {
        baseURL = baseURL.replace('localhost', '127.0.0.1');
      }
      
      // Use axios for direct HTTP requests to Ollama API
      this.client = axios.create({
        baseURL: baseURL,
        timeout: 300000, // 5 minutes timeout for model generation
      });
      logger.info(`Initialized Ollama client at ${baseURL}`);
    } else if (this.config.provider === 'groq') {
      if (!this.config.apiKey) {
        logger.error('GROQ_API_KEY is not set');
        throw new Error('GROQ_API_KEY is required for production');
      }
      this.client = new Groq({ apiKey: this.config.apiKey });
      logger.info('Initialized Groq client');
    }
  }

  /**
   * Generate text completion from LLAMA
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      const { temperature = 0.7, maxTokens = 1000 } = options;

      if (this.config.provider === 'ollama') {
        // Use direct HTTP POST to Ollama API
        const response = await this.client.post('/api/generate', {
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        });
        return response.data.response;
      } else if (this.config.provider === 'groq') {
        const response = await this.client.chat.completions.create({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });
        return response.choices[0].message.content;
      }
    } catch (error) {
      logger.error(`Error generating text: ${error.message}`);
      throw new Error(`AI text generation failed: ${error.message}`);
    }
  }

  /**
   * Check if the AI service is available
   * @returns {Promise<boolean>} Service availability
   */
  async checkHealth() {
    try {
      if (this.config.provider === 'ollama') {
        const response = await this.client.get('/api/tags');
        return response.data !== null;
      } else if (this.config.provider === 'groq') {
        // Try a simple completion
        await this.generateText('Hello', { maxTokens: 5 });
        return true;
      }
    } catch (error) {
      logger.error(`AI service health check failed: ${error.message}`);
      return false;
    }
  }
}

// Singleton instance
const aiService = new AIService();

module.exports = aiService;

