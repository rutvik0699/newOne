const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const config = require('../config/config');
const { HTTP_STATUS } = require('../config/constants');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'Email already in use', HTTP_STATUS.CONFLICT);
    }

    const user = await User.create({ name, email, password, phone, address, role });
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    return ApiResponse.created(res, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return ApiResponse.error(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    return ApiResponse.success(res, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  return ApiResponse.success(res, null, 'Logged out successfully');
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token required', HTTP_STATUS.BAD_REQUEST);
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', HTTP_STATUS.UNAUTHORIZED);
    }

    const accessToken = user.generateAuthToken();
    return ApiResponse.success(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }
    next(error);
  }
};

/**
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    return ApiResponse.success(res, req.user, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    return ApiResponse.success(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refresh, getProfile, updateProfile };
