const aiService = require('./aiService');
const logger = require('../utils/logger');

/**
 * Embedding Service - Generates vector embeddings for thesis documents
 */

class EmbeddingService {
  /**
   * Generate embeddings from title and abstract
   * @param {string} title - Thesis title
   * @param {string} abstract - Thesis abstract
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(title, abstract) {
    try {
      logger.info('Generating embeddings for thesis...');
      
      // Combine title and abstract with more weight to title
      const text = `Title: ${title}\n\nAbstract: ${abstract}`;
      
      const embeddings = await aiService.generateEmbeddings(text);
      
      logger.info(`Generated embeddings with ${embeddings.length} dimensions`);
      return embeddings;
    } catch (error) {
      logger.error(`Error in embedding generation: ${error.message}`);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for a search query
   * @param {string} query - Search query text
   * @returns {Promise<Array<number>>} Query embedding vector
   */
  async generateQueryEmbedding(query) {
    try {
      logger.info('Generating embedding for search query...');
      const embeddings = await aiService.generateEmbeddings(query);
      return embeddings;
    } catch (error) {
      logger.error(`Error generating query embedding: ${error.message}`);
      throw new Error(`Failed to generate query embedding: ${error.message}`);
    }
  }

  /**
   * Batch generate embeddings for multiple texts
   * @param {Array<{title: string, abstract: string}>} documents
   * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
   */
  async batchGenerateEmbeddings(documents) {
    try {
      logger.info(`Generating embeddings for ${documents.length} documents...`);
      
      const embeddings = await Promise.all(
        documents.map(doc => this.generateEmbedding(doc.title, doc.abstract))
      );
      
      logger.info('Batch embedding generation complete');
      return embeddings;
    } catch (error) {
      logger.error(`Error in batch embedding generation: ${error.message}`);
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }
}

const embeddingService = new EmbeddingService();

module.exports = embeddingService;

