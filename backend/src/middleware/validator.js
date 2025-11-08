/**
 * Request validation middleware
 */

/**
 * Validate thesis creation request
 */
exports.validateThesisCreation = (req, res, next) => {
  const { title, abstract } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  } else if (title.length > 500) {
    errors.push('Title cannot exceed 500 characters');
  }

  if (!abstract || typeof abstract !== 'string' || abstract.trim().length === 0) {
    errors.push('Abstract is required and must be a non-empty string');
  } else if (abstract.length > 5000) {
    errors.push('Abstract cannot exceed 5000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate search request
 */
exports.validateSearchRequest = (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Query is required and must be a non-empty string',
    });
  }

  if (query.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Query cannot exceed 500 characters',
    });
  }

  next();
};

/**
 * Validate chat request
 */
exports.validateChatRequest = (req, res, next) => {
  const { message, conversationHistory } = req.body;

  const errors = [];

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Message is required and must be a non-empty string');
  } else if (message.length > 1000) {
    errors.push('Message cannot exceed 1000 characters');
  }

  if (conversationHistory && !Array.isArray(conversationHistory)) {
    errors.push('Conversation history must be an array');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate pagination parameters
 */
exports.validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number',
    });
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
    });
  }

  next();
};

/**
 * Validate batch thesis creation request
 */
exports.validateBatchThesisCreation = (req, res, next) => {
  const { theses } = req.body;

  const errors = [];

  if (!theses || !Array.isArray(theses)) {
    return res.status(400).json({
      success: false,
      message: 'Theses must be an array',
    });
  }

  if (theses.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Theses array cannot be empty',
    });
  }

  if (theses.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Cannot create more than 50 theses at once',
    });
  }

  // Validate each thesis
  theses.forEach((thesis, index) => {
    if (!thesis.title || typeof thesis.title !== 'string' || thesis.title.trim().length === 0) {
      errors.push(`Thesis at index ${index}: Title is required and must be a non-empty string`);
    } else if (thesis.title.length > 500) {
      errors.push(`Thesis at index ${index}: Title cannot exceed 500 characters`);
    }

    if (!thesis.abstract || typeof thesis.abstract !== 'string' || thesis.abstract.trim().length === 0) {
      errors.push(`Thesis at index ${index}: Abstract is required and must be a non-empty string`);
    } else if (thesis.abstract.length > 5000) {
      errors.push(`Thesis at index ${index}: Abstract cannot exceed 5000 characters`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

