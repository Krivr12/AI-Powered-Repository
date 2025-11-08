const Thesis = require('../models/Thesis');
const embeddingService = require('../services/embeddingService');
const tagService = require('../services/tagService');
const searchService = require('../services/searchService');
const logger = require('../utils/logger');

/**
 * Thesis Controller - Handles CRUD operations for theses
 */

/**
 * Create a new thesis
 * @route POST /api/theses
 */
exports.createThesis = async (req, res, next) => {
  try {
    const { title, abstract } = req.body;

    // Validate input
    if (!title || !abstract) {
      return res.status(400).json({
        success: false,
        message: 'Title and abstract are required',
      });
    }

    logger.info(`Creating new thesis: "${title}"`);

    // Generate embeddings and tags in parallel
    const [embeddings, tags] = await Promise.all([
      embeddingService.generateEmbedding(title, abstract),
      tagService.generateTags(title, abstract),
    ]);

    // Create thesis document
    const thesis = await Thesis.create({
      title,
      abstract,
      embeddings,
      tags,
    });

    logger.info(`Thesis created successfully with ID: ${thesis._id}`);

    // Return response without embeddings (too large)
    res.status(201).json({
      success: true,
      message: 'Thesis created successfully',
      data: thesis.toCleanJSON(),
    });
  } catch (error) {
    logger.error(`Error creating thesis: ${error.message}`);
    next(error);
  }
};

/**
 * Create multiple theses in batch
 * @route POST /api/theses/batch
 */
exports.createBatchTheses = async (req, res, next) => {
  try {
    const { theses } = req.body;

    // Validate input
    if (!theses || !Array.isArray(theses) || theses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Theses array is required and must not be empty',
      });
    }

    // Validate each thesis
    for (let i = 0; i < theses.length; i++) {
      if (!theses[i].title || !theses[i].abstract) {
        return res.status(400).json({
          success: false,
          message: `Thesis at index ${i} is missing title or abstract`,
        });
      }
    }

    logger.info(`Creating ${theses.length} theses in batch...`);

    // Generate embeddings and tags for all theses in parallel
    const [embeddingsArray, tagsArray] = await Promise.all([
      embeddingService.batchGenerateEmbeddings(theses),
      tagService.batchGenerateTags(theses),
    ]);

    // Prepare thesis documents
    const thesisDocuments = theses.map((thesis, index) => ({
      title: thesis.title,
      abstract: thesis.abstract,
      embeddings: embeddingsArray[index],
      tags: tagsArray[index],
    }));

    // Insert all theses at once
    const createdTheses = await Thesis.insertMany(thesisDocuments);

    logger.info(`Successfully created ${createdTheses.length} theses`);

    // Return response without embeddings
    const responseData = createdTheses.map(thesis => thesis.toCleanJSON());

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdTheses.length} theses`,
      data: responseData,
      count: createdTheses.length,
    });
  } catch (error) {
    logger.error(`Error creating batch theses: ${error.message}`);
    next(error);
  }
};

/**
 * Get all theses
 * @route GET /api/theses
 */
exports.getAllTheses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    logger.info(`Fetching theses: page ${page}, limit ${limit}`);

    const [theses, total] = await Promise.all([
      Thesis.find()
        .select('-embeddings') // Exclude embeddings
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ [sortBy]: sortOrder }),
      Thesis.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: theses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Error fetching theses: ${error.message}`);
    next(error);
  }
};

/**
 * Get a single thesis by ID
 * @route GET /api/theses/:id
 */
exports.getThesisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info(`Fetching thesis: ${id}`);

    const thesis = await Thesis.findById(id).select('-embeddings');

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: 'Thesis not found',
      });
    }

    res.status(200).json({
      success: true,
      data: thesis,
    });
  } catch (error) {
    logger.error(`Error fetching thesis: ${error.message}`);
    next(error);
  }
};

/**
 * Get theses by tag
 * @route GET /api/theses/tag/:tag
 */
exports.getThesesByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    logger.info(`Fetching theses by tag: "${tag}"`);

    const theses = await searchService.searchByTag(tag, {
      limit: parseInt(limit),
      skip: parseInt(skip),
    });

    res.status(200).json({
      success: true,
      data: theses,
      count: theses.length,
    });
  } catch (error) {
    logger.error(`Error fetching theses by tag: ${error.message}`);
    next(error);
  }
};

/**
 * Get similar theses
 * @route GET /api/theses/:id/similar
 */
exports.getSimilarTheses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    logger.info(`Fetching similar theses for: ${id}`);

    const similarTheses = await searchService.findSimilarTheses(id, parseInt(limit));

    res.status(200).json({
      success: true,
      data: similarTheses,
    });
  } catch (error) {
    logger.error(`Error fetching similar theses: ${error.message}`);
    next(error);
  }
};

/**
 * Get all unique tags
 * @route GET /api/theses/tags/all
 */
exports.getAllTags = async (req, res, next) => {
  try {
    logger.info('Fetching all unique tags');

    const tags = await searchService.getAllTags();

    res.status(200).json({
      success: true,
      data: tags,
      count: tags.length,
    });
  } catch (error) {
    logger.error(`Error fetching tags: ${error.message}`);
    next(error);
  }
};

/**
 * Get repository statistics
 * @route GET /api/theses/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    logger.info('Fetching repository statistics');

    const [totalTheses, allTags] = await Promise.all([
      Thesis.countDocuments(),
      searchService.getAllTags(),
    ]);

    const stats = {
      totalTheses,
      totalUniqueTags: allTags.length,
      topTags: allTags.slice(0, 10),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Error fetching stats: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a thesis (optional - for admin use)
 * @route DELETE /api/theses/:id
 */
exports.deleteThesis = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info(`Deleting thesis: ${id}`);

    const thesis = await Thesis.findByIdAndDelete(id);

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: 'Thesis not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thesis deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting thesis: ${error.message}`);
    next(error);
  }
};

