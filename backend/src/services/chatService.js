const aiService = require('./aiService');
const searchService = require('./searchService');
const logger = require('../utils/logger');

/**
 * Chat Service - RAG-based chatbot for thesis queries
 */

class ChatService {
  /**
   * Process a chat message using RAG (Retrieval Augmented Generation)
   * @param {string} message - User's chat message
   * @param {object} options - Chat options
   * @returns {Promise<object>} Chat response with answer and sources
   */
  async processMessage(message, options = {}) {
    try {
      const { conversationHistory = [], topK = 3 } = options;

      logger.info(`Processing chat message: "${message}"`);

      // Step 1: Retrieve relevant theses using semantic search
      const relevantTheses = await searchService.semanticSearch(message, {
        limit: topK,
        threshold: 0.3, // Lower threshold for broader context
      });

      if (relevantTheses.length === 0) {
        return {
          answer: "I couldn't find any relevant theses in the repository to answer your question. Please try rephrasing your query or asking about different topics.",
          sources: [],
          conversationHistory: [...conversationHistory, { role: 'user', content: message }],
        };
      }

      // Step 2: Build context from retrieved theses
      const context = this.buildContext(relevantTheses);

      // Step 3: Generate response using LLAMA with RAG
      const answer = await this.generateRAGResponse(message, context, conversationHistory);

      // Step 4: Format sources
      const sources = relevantTheses.map((thesis) => ({
        id: thesis._id,
        title: thesis.title,
        tags: thesis.tags,
        relevanceScore: thesis.score,
      }));

      logger.info('Chat response generated successfully');

      return {
        answer,
        sources,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: answer },
        ],
      };
    } catch (error) {
      logger.error(`Error processing chat message: ${error.message}`);
      throw new Error(`Chat processing failed: ${error.message}`);
    }
  }

  /**
   * Build context string from relevant theses
   * @param {Array} theses - Array of relevant theses
   * @returns {string} Formatted context string
   */
  buildContext(theses) {
    let context = 'Here are some relevant theses from the repository:\n\n';

    theses.forEach((thesis, index) => {
      context += `Thesis ${index + 1}:\n`;
      context += `Title: ${thesis.title}\n`;
      context += `Abstract: ${thesis.abstract}\n`;
      context += `Tags: ${thesis.tags.join(', ')}\n\n`;
    });

    return context;
  }

  /**
   * Generate RAG response using LLAMA
   * @param {string} userMessage - User's question
   * @param {string} context - Context from retrieved theses
   * @param {Array} conversationHistory - Previous conversation turns
   * @returns {Promise<string>} Generated answer
   */
  async generateRAGResponse(userMessage, context, conversationHistory) {
    try {
      // Build the prompt with context and conversation history
      let prompt = `You are an AI assistant helping users explore an academic thesis repository. Your role is to answer questions about theses based on the provided context.

Context from the thesis repository:
${context}

`;

      // Add conversation history if available
      if (conversationHistory.length > 0) {
        prompt += 'Previous conversation:\n';
        conversationHistory.forEach((turn) => {
          prompt += `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}\n`;
        });
        prompt += '\n';
      }

      prompt += `User question: ${userMessage}

Instructions:
- Answer based on the provided thesis context
- Be concise but informative
- If the context doesn't contain enough information, say so
- Reference specific theses when relevant
- If asked about topics not in the context, politely state that you don't have that information in the repository

Answer:`;

      const answer = await aiService.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 500,
      });

      return answer.trim();
    } catch (error) {
      logger.error(`Error generating RAG response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get suggested questions based on thesis topics
   * @returns {Promise<Array<string>>} Array of suggested questions
   */
  async getSuggestedQuestions() {
    try {
      // Get all tags to understand available topics
      const allTags = await searchService.getAllTags();

      if (allTags.length === 0) {
        return [
          'What theses are available in the repository?',
          'Tell me about the latest research topics.',
        ];
      }

      // Generate suggested questions based on available tags
      const topTags = allTags.slice(0, 5);
      const suggestions = [
        `What theses are related to ${topTags[0] || 'research'}?`,
        `Can you summarize theses about ${topTags[1] || 'technology'}?`,
        'What are the most recent theses in the repository?',
        `Tell me about research on ${topTags[2] || 'science'}.`,
      ];

      return suggestions;
    } catch (error) {
      logger.error(`Error generating suggested questions: ${error.message}`);
      return ['What theses are available?'];
    }
  }

  /**
   * Generate a summary of a specific thesis
   * @param {string} thesisId - ID of the thesis
   * @returns {Promise<string>} AI-generated summary
   */
  async summarizeThesis(thesisId) {
    try {
      const Thesis = require('../models/Thesis');
      const thesis = await Thesis.findById(thesisId);

      if (!thesis) {
        throw new Error('Thesis not found');
      }

      const prompt = `Provide a concise 2-3 sentence summary of the following thesis:

Title: ${thesis.title}
Abstract: ${thesis.abstract}

Summary:`;

      const summary = await aiService.generateText(prompt, {
        temperature: 0.5,
        maxTokens: 150,
      });

      return summary.trim();
    } catch (error) {
      logger.error(`Error summarizing thesis: ${error.message}`);
      throw new Error(`Thesis summarization failed: ${error.message}`);
    }
  }
}

const chatService = new ChatService();

module.exports = chatService;

