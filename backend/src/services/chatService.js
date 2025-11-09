const aiService = require('./aiService');
const searchService = require('./searchService');
const logger = require('../utils/logger');

/**
 * Chat Service - RAG-based chatbot with Query Rewriting
 * Uses Llama 3.2 with semantic search and query optimization
 */

class ChatService {
  /**
   * Process a chat message using RAG with query rewriting
   * @param {string} message - User's chat message
   * @param {object} options - Chat options
   * @returns {Promise<object>} Chat response with answer and sources
   */
  async processMessage(message, options = {}) {
    try {
      const { conversationHistory = [], topK = 3 } = options;

      logger.info(`Processing chat message: "${message}"`);

      // Step 1: Rewrite/optimize the query for better semantic search
      const optimizedQuery = await this.rewriteQuery(message, conversationHistory);
      logger.info(`Original query: "${message}" → Optimized: "${optimizedQuery}"`);

      // Step 2: Retrieve relevant theses using semantic search
      const relevantTheses = await searchService.semanticSearch(optimizedQuery, {
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

      // Step 3: Build context from retrieved theses
      const context = this.buildContext(relevantTheses);

      // Step 4: Generate response using LLAMA with RAG
      const answer = await this.generateRAGResponse(message, context, conversationHistory);

      // Step 5: Format sources
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
   * Rewrite/optimize user query for better semantic search
   * @param {string} userQuery - Original user query
   * @param {Array} conversationHistory - Previous conversation turns
   * @returns {Promise<string>} Optimized search query
   */
  async rewriteQuery(userQuery, conversationHistory) {
    try {
      // Build context from conversation history if available
      let historyContext = '';
      if (conversationHistory.length > 0) {
        historyContext = '\n\nPrevious conversation context:\n';
        conversationHistory.slice(-3).forEach((turn) => {
          // Only use last 3 turns to keep context focused
          historyContext += `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}\n`;
        });
      }

      const prompt = `You are a query optimization assistant. Your task is to rewrite user questions into optimized search queries that will retrieve the most relevant academic theses from a repository.

Instructions:
- Extract key concepts, topics, and technical terms from the user's question
- Expand abbreviations and acronyms (e.g., "AI" → "artificial intelligence")
- Add related synonyms and domain-specific terms
- Keep the query concise (1-2 sentences or key phrases)
- Focus on the main topic and important keywords
- If the question is already clear and specific, you can return it as-is or make minor improvements
${historyContext}
User question: ${userQuery}

Optimized search query:`;

      const optimizedQuery = await aiService.generateText(prompt, {
        temperature: 0.3, // Lower temperature for more consistent, focused queries
        maxTokens: 100,
      });

      // Clean up the response (remove quotes, extra whitespace, etc.)
      let cleanedQuery = optimizedQuery.trim();
      cleanedQuery = cleanedQuery.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      cleanedQuery = cleanedQuery.replace(/\n+/g, ' '); // Replace newlines with spaces
      cleanedQuery = cleanedQuery.trim();

      // Fallback to original query if optimization failed or produced empty result
      if (!cleanedQuery || cleanedQuery.length < 3) {
        logger.warn('Query rewriting produced empty result, using original query');
        return userQuery;
      }

      return cleanedQuery;
    } catch (error) {
      logger.error(`Error rewriting query: ${error.message}`);
      // Fallback to original query if rewriting fails
      return userQuery;
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
      if (thesis.tags && thesis.tags.length > 0) {
        context += `Tags: ${thesis.tags.join(', ')}\n`;
      }
      context += '\n';
    });

    return context;
  }

  /**
   * Generate RAG response using LLAMA with context from theses
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
- Reference specific theses when relevant (e.g., "According to Thesis 1..." or "The research on [topic] shows...")
- If asked about topics not in the context, politely state that you don't have that information in the repository
- Use natural, conversational language

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
