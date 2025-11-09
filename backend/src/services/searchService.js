const Thesis = require('../models/Thesis');
const embeddingService = require('./embeddingService');
const { dotProduct } = require('../utils/vectorUtils');
const logger = require('../utils/logger');

/**
 * Search Service - Handles semantic search operations
 */

class SearchService {
  /**
   * Perform semantic search using MongoDB Atlas Vector Search
   * Falls back to manual dot product search if Atlas search is unavailable
   * @param {string} query - Search query text
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of relevant theses with similarity scores
   */
  async semanticSearch(query, options = {}) {
    try {
      const { limit = 10, threshold = 0.5 } = options;

      logger.info(`Performing semantic search for: "${query}"`);

      // Generate embedding for the search query
      const queryEmbedding = await embeddingService.generateQueryEmbedding(query);

      // Try MongoDB Atlas Vector Search first
      try {
        const results = await this.atlasVectorSearch(queryEmbedding, limit, threshold);
        if (results && results.length > 0) {
          logger.info(`Found ${results.length} results using Atlas Vector Search`);
          return results;
        }
      } catch (atlasError) {
        logger.warn('Atlas Vector Search not available, falling back to manual search');
      }

      // Fallback to manual dot product search
      const results = await this.manualVectorSearch(queryEmbedding, limit, threshold);
      logger.info(`Found ${results.length} results using manual search`);
      return results;
    } catch (error) {
      logger.error(`Error in semantic search: ${error.message}`);
      throw new Error(`Semantic search failed: ${error.message}`);
    }
  }

  /**
   * MongoDB Atlas Vector Search
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {number} limit - Maximum number of results
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Promise<Array>} Search results
   */
  async atlasVectorSearch(queryEmbedding, limit, threshold) {
    try {
      // MongoDB Atlas Vector Search aggregation pipeline
      const pipeline = [
        {
          $vectorSearch: {
            index: 'semanticsearch', // Vector search index name
            path: 'embeddings',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit,
          },
        },
        {
          $addFields: {
            score: { $meta: 'vectorSearchScore' },
          },
        },
        {
          $match: {
            score: { $gte: threshold },
          },
        },
        {
          $project: {
            title: 1,
            abstract: 1,
            tags: 1,
            createdAt: 1,
            score: 1,
          },
        },
      ];

      const results = await Thesis.aggregate(pipeline);
      return results;
    } catch (error) {
      // If vector search is not configured, this will fail
      throw new Error('Atlas Vector Search not configured');
    }
  }

  /**
   * Manual vector search using dot product
   * Uses dot product to match MongoDB Atlas Vector Search similarity metric
   * @param {Array<number>} queryEmbedding - Query embedding vector (normalized)
   * @param {number} limit - Maximum number of results
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Promise<Array>} Search results with similarity scores
   */
  async manualVectorSearch(queryEmbedding, limit, threshold) {
    try {
      // Get all theses with embeddings
      const allTheses = await Thesis.find({}).lean();

      // Calculate dot product similarity for each thesis
      // Since embeddings are normalized, dot product = cosine similarity
      const resultsWithScores = allTheses.map((thesis) => {
        const score = dotProduct(queryEmbedding, thesis.embeddings);
        return {
          ...thesis,
          score,
          // Remove large embedding array from response
          embeddings: undefined,
        };
      });

      // Filter by threshold and sort by score
      const filteredResults = resultsWithScores
        .filter((result) => result.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return filteredResults;
    } catch (error) {
      logger.error(`Error in manual vector search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search theses by tag
   * @param {string} tag - Tag to search for
   * @param {object} options - Search options
   * @returns {Promise<Array>} Matching theses
   */
  async searchByTag(tag, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;

      logger.info(`Searching theses by tag: "${tag}"`);

      const theses = await Thesis.find({
        tags: { $regex: new RegExp(tag, 'i') }, // Case-insensitive match
      })
        .select('-embeddings') // Exclude embeddings from response
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      logger.info(`Found ${theses.length} theses with tag "${tag}"`);
      return theses;
    } catch (error) {
      logger.error(`Error searching by tag: ${error.message}`);
      throw new Error(`Tag search failed: ${error.message}`);
    }
  }

  /**
   * Get similar theses based on a thesis ID
   * @param {string} thesisId - ID of the reference thesis
   * @param {number} limit - Maximum number of similar theses
   * @returns {Promise<Array>} Similar theses
   */
  async findSimilarTheses(thesisId, limit = 5) {
    try {
      logger.info(`Finding theses similar to: ${thesisId}`);

      const referenceThesis = await Thesis.findById(thesisId);
      if (!referenceThesis) {
        throw new Error('Thesis not found');
      }

      // Get all other theses
      const allTheses = await Thesis.find({ _id: { $ne: thesisId } }).lean();

      // Calculate similarity scores using dot product
      // Since embeddings are normalized, dot product = cosine similarity
      const resultsWithScores = allTheses.map((thesis) => {
        const score = dotProduct(
          referenceThesis.embeddings,
          thesis.embeddings
        );
        return {
          ...thesis,
          score,
          embeddings: undefined,
        };
      });

      // Sort by score and return top results
      const similarTheses = resultsWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      logger.info(`Found ${similarTheses.length} similar theses`);
      return similarTheses;
    } catch (error) {
      logger.error(`Error finding similar theses: ${error.message}`);
      throw new Error(`Similar thesis search failed: ${error.message}`);
    }
  }

  /**
   * Get all unique tags from the database
   * @returns {Promise<Array<string>>} Array of unique tags
   */
  async getAllTags() {
    try {
      const tags = await Thesis.distinct('tags');
      logger.info(`Retrieved ${tags.length} unique tags`);
      return tags.sort();
    } catch (error) {
      logger.error(`Error getting all tags: ${error.message}`);
      throw new Error(`Failed to retrieve tags: ${error.message}`);
    }
  }
}

const searchService = new SearchService();

module.exports = searchService;

