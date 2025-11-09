const aiService = require('./aiService');
const logger = require('../utils/logger');

/**
 * Simple Chat Service - Direct LLAMA chatbot without RAG
 * Uses only Llama 3.2 for conversation, no semantic search
 */

class SimpleChatService {
  /**
   * Process a chat message using only LLAMA
   * @param {string} message - User's chat message
   * @param {object} options - Chat options
   * @returns {Promise<object>} Chat response with answer
   */
  async processMessage(message, options = {}) {
    try {
      const { conversationHistory = [] } = options;

      logger.info(`Processing simple chat message: "${message}"`);

      // Generate response using LLAMA with conversation history
      const answer = await this.generateResponse(message, conversationHistory);

      logger.info('Simple chat response generated successfully');

      return {
        answer,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: answer },
        ],
      };
    } catch (error) {
      logger.error(`Error processing simple chat message: ${error.message}`);
      throw new Error(`Simple chat processing failed: ${error.message}`);
    }
  }

  /**
   * Generate response using LLAMA
   * @param {string} userMessage - User's question
   * @param {Array} conversationHistory - Previous conversation turns
   * @returns {Promise<string>} Generated answer
   */
  async generateResponse(userMessage, conversationHistory) {
    try {
      // Build the prompt with conversation history
      let prompt = `You are a helpful AI assistant. You help users with questions and conversations in a friendly, informative manner.

`;

      // Add conversation history if available
      if (conversationHistory.length > 0) {
        prompt += 'Previous conversation:\n';
        conversationHistory.forEach((turn) => {
          const role = turn.role === 'user' ? 'User' : 'Assistant';
          prompt += `${role}: ${turn.content}\n`;
        });
        prompt += '\n';
      }

      prompt += `User: ${userMessage}

Assistant:`;

      const answer = await aiService.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      return answer.trim();
    } catch (error) {
      logger.error(`Error generating simple chat response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a simple greeting
   * @returns {Promise<string>} Greeting message
   */
  async getGreeting() {
    try {
      const prompt = `You are a friendly AI assistant. Generate a brief, welcoming greeting message (1-2 sentences) for a user starting a conversation.`;

      const greeting = await aiService.generateText(prompt, {
        temperature: 0.8,
        maxTokens: 50,
      });

      return greeting.trim();
    } catch (error) {
      logger.error(`Error generating greeting: ${error.message}`);
      return "Hello! I'm your AI assistant. How can I help you today?";
    }
  }
}

const simpleChatService = new SimpleChatService();

module.exports = simpleChatService;

