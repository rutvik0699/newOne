const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatResponse(null, 'No token provided', false));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json(formatResponse(null, 'User not found', false));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatResponse(null, 'Token expired', false));
    }
    return res.status(401).json(formatResponse(null, 'Invalid token', false));
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json(formatResponse(null, 'Access denied: Admins only', false));
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch (_err) {
    // Token invalid or expired — proceed without user
  }
  next();
};

module.exports = { verifyToken, isAdmin, optionalAuth };
