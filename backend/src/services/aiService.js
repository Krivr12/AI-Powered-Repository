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
   * Generate embeddings from text
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbeddings(text) {
    try {
      if (this.config.provider === 'ollama') {
        // Ollama has native embedding support
        const response = await this.client.embeddings({
          model: this.config.embeddingModel,
          prompt: text,
        });
        return response.embedding;
      } else if (this.config.provider === 'groq') {
        // Groq doesn't have native embeddings, so we'll create a simple hash-based embedding
        // For production, you might want to use a dedicated embedding service
        // or Ollama for embeddings even in production
        logger.warn('Using simulated embeddings for Groq - consider using Ollama for embeddings');
        return this.simulateEmbeddings(text);
      }
    } catch (error) {
      logger.error(`Error generating embeddings: ${error.message}`);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Simulate embeddings (fallback for providers without embedding support)
   * This is a simple implementation - for production, use proper embedding models
   * @param {string} text - Text to embed
   * @returns {Array<number>} Simulated embedding vector
   */
  simulateEmbeddings(text) {
    const dimension = 768; // Standard BERT-like dimension
    const embedding = new Array(dimension).fill(0);
    
    // Simple hash-based embedding (for demo purposes)
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = charCode % dimension;
      embedding[index] += charCode / 1000;
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (norm || 1));
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

