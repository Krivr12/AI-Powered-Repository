const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { validateSearchRequest } = require('../middleware/validator');

/**
 * Search Routes
 */

// Semantic search
router.post('/semantic', validateSearchRequest, searchController.semanticSearch);

// Search by tags
router.post('/tags', searchController.searchByTags);

// Combined search (text + tags)
router.post('/combined', searchController.combinedSearch);

module.exports = router;

