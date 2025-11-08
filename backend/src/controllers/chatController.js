const chatService = require('../services/chatService');
const logger = require('../utils/logger');

/**
 * Chat Controller - Handles AI chatbot interactions
 */

/**
 * Process a chat message
 * @route POST /api/chat
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [], topK = 3 } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message parameter is required and must be a string',
      });
    }

    logger.info(`Chat request: "${message.substring(0, 50)}..."`);

    const response = await chatService.processMessage(message, {
      conversationHistory,
      topK: parseInt(topK),
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error(`Error processing chat: ${error.message}`);
    next(error);
  }
};

/**
 * Get suggested questions
 * @route GET /api/chat/suggestions
 */
exports.getSuggestions = async (req, res, next) => {
  try {
    logger.info('Fetching suggested questions');

    const suggestions = await chatService.getSuggestedQuestions();

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error(`Error getting suggestions: ${error.message}`);
    next(error);
  }
};

/**
 * Get AI summary of a specific thesis
 * @route GET /api/chat/summarize/:id
 */
exports.summarizeThesis = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info(`Generating summary for thesis: ${id}`);

    const summary = await chatService.summarizeThesis(id);

    res.status(200).json({
      success: true,
      data: {
        thesisId: id,
        summary,
      },
    });
  } catch (error) {
    logger.error(`Error summarizing thesis: ${error.message}`);
    next(error);
  }
};

