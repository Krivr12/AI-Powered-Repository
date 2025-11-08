const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { validateChatRequest } = require('../middleware/validator');

/**
 * Chat Routes
 */

// Process chat message
router.post('/', validateChatRequest, chatController.chat);

// Get suggested questions
router.get('/suggestions', chatController.getSuggestions);

// Summarize a specific thesis
router.get('/summarize/:id', chatController.summarizeThesis);

module.exports = router;

