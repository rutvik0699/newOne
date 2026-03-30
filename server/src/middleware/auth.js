const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const config = require('../config/config');
const { HTTP_STATUS, USER_ROLES } = require('../config/constants');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Access token required', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return ApiResponse.error(res, 'User not found', HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED);
    }
    return ApiResponse.error(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED);
  }
};

/**
 * Restrict access to admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    return ApiResponse.error(res, 'Admin access required', HTTP_STATUS.FORBIDDEN);
  }
  next();
};

module.exports = { authenticate, requireAdmin };
