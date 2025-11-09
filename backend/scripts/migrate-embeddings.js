/**
 * Migration Script: Update Embeddings to xenova/all-MiniLm-L6-v2
 * 
 * This script updates all existing theses in the database with new embeddings
 * generated using the xenova/all-MiniLm-L6-v2 model (384 dimensions).
 * 
 * Usage: node scripts/migrate-embeddings.js
 * 
 * Prerequisites:
 * - MongoDB connection string in .env (MONGODB_URI)
 * - Vector search index "semanticsearch" must exist in MongoDB Atlas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const Thesis = require('../src/models/Thesis');
const embeddingService = require('../src/services/embeddingService');
const logger = require('../src/utils/logger');

/**
 * Main migration function
 */
async function migrateEmbeddings() {
  try {
    logger.info('='.repeat(60));
    logger.info('Starting Embedding Migration');
    logger.info('Model: xenova/all-MiniLm-L6-v2 (384 dimensions)');
    logger.info('='.repeat(60));

    // Connect to database
    logger.info('Connecting to MongoDB...');
    await connectDB();
    logger.info('✓ Connected to MongoDB');

    // Get total count of theses
    const totalTheses = await Thesis.countDocuments();
    logger.info(`\nFound ${totalTheses} theses to migrate`);

    if (totalTheses === 0) {
      logger.info('No theses found. Exiting.');
      process.exit(0);
    }

    // Fetch all theses
    logger.info('Fetching all theses...');
    const theses = await Thesis.find({}).lean();
    logger.info(`✓ Loaded ${theses.length} theses\n`);

    // Statistics
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each thesis
    for (let i = 0; i < theses.length; i++) {
      const thesis = theses[i];
      const progress = `[${i + 1}/${theses.length}]`;

      try {
        logger.info(`${progress} Processing: "${thesis.title.substring(0, 50)}${thesis.title.length > 50 ? '...' : ''}"`);

        // Generate new embedding
        const newEmbedding = await embeddingService.generateEmbedding(
          thesis.title,
          thesis.abstract
        );

        // Validate embedding dimensions
        if (newEmbedding.length !== 384) {
          throw new Error(`Expected 384 dimensions, got ${newEmbedding.length}`);
        }

        // Update thesis with new embedding
        await Thesis.findByIdAndUpdate(
          thesis._id,
          { $set: { embeddings: newEmbedding } },
          { new: true }
        );

        successCount++;
        logger.info(`${progress} ✓ Successfully updated (${newEmbedding.length} dimensions)`);
      } catch (error) {
        errorCount++;
        const errorMsg = `${progress} ✗ Error: ${error.message}`;
        logger.error(errorMsg);
        errors.push({
          thesisId: thesis._id,
          title: thesis.title,
          error: error.message,
        });
      }

      // Add a small delay to avoid overwhelming the system
      if (i < theses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Print summary
    logger.info('\n' + '='.repeat(60));
    logger.info('Migration Summary');
    logger.info('='.repeat(60));
    logger.info(`Total theses: ${totalTheses}`);
    logger.info(`Successfully updated: ${successCount}`);
    logger.info(`Failed: ${errorCount}`);

    if (errors.length > 0) {
      logger.info('\nErrors encountered:');
      errors.forEach((err, idx) => {
        logger.error(`  ${idx + 1}. Thesis ID: ${err.thesisId}`);
        logger.error(`     Title: ${err.title}`);
        logger.error(`     Error: ${err.error}`);
      });
    }

    logger.info('\n✓ Migration completed!');
    logger.info('='.repeat(60));

    // Close database connection
    await mongoose.connection.close();
    logger.info('Database connection closed');

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    logger.error(`Fatal error during migration: ${error.message}`);
    logger.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateEmbeddings();

