const { Ollama } = require('ollama');
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
      this.client = new Ollama({ host: this.config.baseUrl });
      logger.info('Initialized Ollama client');
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
        const response = await this.client.generate({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        });
        return response.response;
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
        const response = await this.client.list();
        return response !== null;
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

