const aiService = require('./aiService');
const logger = require('../utils/logger');

/**
 * Tag Service - Generates AI-powered tags for thesis documents
 */

class TagService {
  /**
   * Generate 3-5 descriptive tags for a thesis
   * @param {string} title - Thesis title
   * @param {string} abstract - Thesis abstract
   * @returns {Promise<Array<string>>} Array of 3-5 tags
   */
  async generateTags(title, abstract) {
    try {
      logger.info('Generating AI tags for thesis...');

      const prompt = `You are an expert academic librarian. Based on the following thesis title and abstract, generate exactly 3-5 short descriptive tags (1-2 words each) that best categorize this work.

Title: ${title}

Abstract: ${abstract}

Instructions:
- Generate between 3 and 5 tags
- Each tag should be 1-2 words maximum
- Tags should be lowercase
- Focus on key topics, methodologies, or domains
- Separate tags with commas
- Do not include any explanation, just return the tags

Example format: machine learning, neural networks, computer vision, image classification

Tags:`;

      const response = await aiService.generateText(prompt, {
        temperature: 0.3, // Lower temperature for more consistent output
        maxTokens: 100,
      });

      // Parse the tags from the response
      const tags = this.parseTags(response);

      if (tags.length < 3 || tags.length > 5) {
        logger.warn(`Generated ${tags.length} tags, expected 3-5. Adjusting...`);
        return this.adjustTagCount(tags);
      }

      logger.info(`Generated ${tags.length} tags: ${tags.join(', ')}`);
      return tags;
    } catch (error) {
      logger.error(`Error generating tags: ${error.message}`);
      throw new Error(`Failed to generate tags: ${error.message}`);
    }
  }

  /**
   * Parse tags from AI response
   * @param {string} response - AI response text
   * @returns {Array<string>} Cleaned array of tags
   */
  parseTags(response) {
    // Clean up the response
    let cleanedResponse = response.trim().toLowerCase();
    
    // Remove common prefixes
    cleanedResponse = cleanedResponse.replace(/^tags?:\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/^here are the tags?:\s*/i, '');
    
    // Split by comma or newline
    let tags = cleanedResponse
      .split(/[,\n]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length < 30) // Filter out empty or too long tags
      .filter(tag => !/[.!?]/.test(tag)); // Remove tags with punctuation
    
    // Take only 1-2 word tags
    tags = tags
      .map(tag => tag.replace(/[^a-z0-9\s-]/g, ''))
      .filter(tag => {
        const wordCount = tag.split(/\s+/).length;
        return wordCount <= 2;
      });
    
    // Remove duplicates
    tags = [...new Set(tags)];
    
    return tags;
  }

  /**
   * Adjust tag count to be within 3-5 range
   * @param {Array<string>} tags - Original tags array
   * @returns {Array<string>} Adjusted tags array
   */
  adjustTagCount(tags) {
    if (tags.length < 3) {
      // If too few tags, add generic ones (fallback)
      logger.warn('Too few tags generated, using fallbacks');
      const fallbackTags = ['research', 'academic', 'study', 'analysis', 'theory'];
      while (tags.length < 3 && fallbackTags.length > 0) {
        const fallback = fallbackTags.shift();
        if (!tags.includes(fallback)) {
          tags.push(fallback);
        }
      }
    } else if (tags.length > 5) {
      // If too many tags, keep only the first 5
      tags = tags.slice(0, 5);
    }
    return tags;
  }

  /**
   * Batch generate tags for multiple documents
   * @param {Array<{title: string, abstract: string}>} documents
   * @returns {Promise<Array<Array<string>>>} Array of tag arrays
   */
  async batchGenerateTags(documents) {
    try {
      logger.info(`Generating tags for ${documents.length} documents...`);
      
      const tagArrays = await Promise.all(
        documents.map(doc => this.generateTags(doc.title, doc.abstract))
      );
      
      logger.info('Batch tag generation complete');
      return tagArrays;
    } catch (error) {
      logger.error(`Error in batch tag generation: ${error.message}`);
      throw new Error(`Failed to generate batch tags: ${error.message}`);
    }
  }
}

const tagService = new TagService();

module.exports = tagService;

