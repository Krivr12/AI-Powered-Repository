const searchService = require('../services/searchService');
const logger = require('../utils/logger');

/**
 * Search Controller - Handles search operations
 */

/**
 * Perform semantic search
 * @route POST /api/search/semantic
 */
exports.semanticSearch = async (req, res, next) => {
  try {
    const { query, limit = 10, threshold = 0.5 } = req.body;

    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required and must be a string',
      });
    }

    logger.info(`Semantic search request: "${query}"`);

    const results = await searchService.semanticSearch(query, {
      limit: parseInt(limit),
      threshold: parseFloat(threshold),
    });

    res.status(200).json({
      success: true,
      query,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error(`Error in semantic search: ${error.message}`);
    next(error);
  }
};

/**
 * Search by multiple tags (AND/OR logic)
 * @route POST /api/search/tags
 */
exports.searchByTags = async (req, res, next) => {
  try {
    const { tags, operator = 'OR', limit = 10 } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tags parameter is required and must be a non-empty array',
      });
    }

    logger.info(`Tag search request: ${tags.join(', ')} (${operator})`);

    const Thesis = require('../models/Thesis');

    let query;
    if (operator === 'AND') {
      // All tags must be present
      query = { tags: { $all: tags } };
    } else {
      // Any tag can be present
      query = { tags: { $in: tags } };
    }

    const results = await Thesis.find(query)
      .select('-embeddings')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      searchParams: { tags, operator },
    });
  } catch (error) {
    logger.error(`Error in tag search: ${error.message}`);
    next(error);
  }
};

/**
 * Combined search (text + tags)
 * @route POST /api/search/combined
 */
exports.combinedSearch = async (req, res, next) => {
  try {
    const { query, tags, limit = 10 } = req.body;

    if (!query && (!tags || tags.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Either query or tags must be provided',
      });
    }

    logger.info('Combined search request');

    let results;

    if (query && tags && tags.length > 0) {
      // Semantic search first
      const semanticResults = await searchService.semanticSearch(query, { limit: 50 });
      
      // Filter by tags
      results = semanticResults
        .filter((thesis) => tags.some((tag) => thesis.tags.includes(tag)))
        .slice(0, limit);
    } else if (query) {
      results = await searchService.semanticSearch(query, { limit });
    } else {
      const Thesis = require('../models/Thesis');
      results = await Thesis.find({ tags: { $in: tags } })
        .select('-embeddings')
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error(`Error in combined search: ${error.message}`);
    next(error);
  }
};

