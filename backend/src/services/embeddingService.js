const { pipeline } = require('@xenova/transformers');
const logger = require('../utils/logger');

/**
 * Embedding Service - Generates vector embeddings using xenova/all-MiniLm-L6-v2
 * This model produces 384-dimensional embeddings
 */

class EmbeddingService {
  constructor() {
    this.model = null;
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
    this.embeddingDimensions = 384;
  }

  /**
   * Initialize the embedding model (lazy loading)
   * @returns {Promise<void>}
   */
  async initializeModel() {
    if (this.model) {
      return;
    }

    try {
      logger.info(`Loading embedding model: ${this.modelName}...`);
      this.model = await pipeline('feature-extraction', this.modelName);
      logger.info('Embedding model loaded successfully');
    } catch (error) {
      logger.error(`Error loading embedding model: ${error.message}`);
      throw new Error(`Failed to load embedding model: ${error.message}`);
    }
  }

  /**
   * Generate embeddings from text
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector (384 dimensions)
   */
  async generateEmbeddingFromText(text) {
    try {
      // Ensure model is loaded
      await this.initializeModel();

      // Generate embeddings
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert tensor to array
      // The output is a tensor, extract the data array
      let embedding;
      if (output.data) {
        // If output has .data property (tensor)
        embedding = Array.from(output.data);
      } else if (Array.isArray(output)) {
        // If output is already an array
        embedding = output.flat();
      } else if (output.tolist) {
        // If output has tolist method
        embedding = output.tolist().flat();
      } else {
        // Fallback: try to convert to array
        embedding = Array.from(output).flat();
      }

      // Ensure we have a 1D array of the correct dimensions
      if (Array.isArray(embedding[0])) {
        embedding = embedding[0];
      }

      // Validate dimensions
      if (embedding.length !== this.embeddingDimensions) {
        logger.warn(`Expected ${this.embeddingDimensions} dimensions, got ${embedding.length}`);
        // Truncate or pad if necessary (shouldn't happen, but just in case)
        if (embedding.length > this.embeddingDimensions) {
          embedding = embedding.slice(0, this.embeddingDimensions);
        } else {
          // Pad with zeros (shouldn't happen with this model)
          while (embedding.length < this.embeddingDimensions) {
            embedding.push(0);
          }
        }
      }

      return embedding;
    } catch (error) {
      logger.error(`Error generating embedding: ${error.message}`);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings from title and abstract
   * @param {string} title - Thesis title
   * @param {string} abstract - Thesis abstract
   * @returns {Promise<Array<number>>} Embedding vector (384 dimensions)
   */
  async generateEmbedding(title, abstract) {
    try {
      logger.info('Generating embeddings for thesis...');
      
      // Combine title and abstract with more weight to title
      const text = `Title: ${title}\n\nAbstract: ${abstract}`;
      
      const embeddings = await this.generateEmbeddingFromText(text);
      
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
   * @returns {Promise<Array<number>>} Query embedding vector (384 dimensions)
   */
  async generateQueryEmbedding(query) {
    try {
      logger.info('Generating embedding for search query...');
      const embeddings = await this.generateEmbeddingFromText(query);
      return embeddings;
    } catch (error) {
      logger.error(`Error generating query embedding: ${error.message}`);
      throw new Error(`Failed to generate query embedding: ${error.message}`);
    }
  }

  /**
   * Batch generate embeddings for multiple texts
   * @param {Array<{title: string, abstract: string}>} documents
   * @returns {Promise<Array<Array<number>>>} Array of embedding vectors (384 dimensions each)
   */
  async batchGenerateEmbeddings(documents) {
    try {
      logger.info(`Generating embeddings for ${documents.length} documents...`);
      
      // Ensure model is loaded
      await this.initializeModel();
      
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
