const crypto = require('crypto');
const { PAGINATION } = require('../config/constants');

/**
 * Build pagination options from query params
 */
const getPaginationOptions = (query) => {
  const page = Math.max(parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE, 1);
  const limit = Math.min(
    parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

/**
 * Format a date to ISO string or null
 */
const formatDate = (date) => (date ? new Date(date).toISOString() : null);

/**
 * Generate a cryptographically secure random hex string
 */
const generateRandom = (length = 32) => crypto.randomBytes(length).toString('hex');

module.exports = { getPaginationOptions, buildPaginationMeta, formatDate, generateRandom };
