const express = require('express');
const router = express.Router();
const thesisController = require('../controllers/thesisController');
const { validateThesisCreation, validatePagination, validateBatchThesisCreation } = require('../middleware/validator');

/**
 * Thesis Routes
 */

// Create new thesis
router.post('/', validateThesisCreation, thesisController.createThesis);

// Create multiple theses in batch
router.post('/batch', validateBatchThesisCreation, thesisController.createBatchTheses);

// Get all theses
router.get('/', validatePagination, thesisController.getAllTheses);

// Get statistics
router.get('/stats', thesisController.getStats);

// Get all unique tags
router.get('/tags/all', thesisController.getAllTags);

// Get theses by tag
router.get('/tag/:tag', thesisController.getThesesByTag);

// Get thesis by ID
router.get('/:id', thesisController.getThesisById);

// Get similar theses
router.get('/:id/similar', thesisController.getSimilarTheses);

// Delete thesis (for admin use)
router.delete('/:id', thesisController.deleteThesis);

module.exports = router;

