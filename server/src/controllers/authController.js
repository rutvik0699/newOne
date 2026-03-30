const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json(formatResponse(null, 'Email already registered', false));
    }

    const user = await User.create({ name, email, password, phone, address, role });
    const { accessToken, refreshToken } = generateTokens(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    return res.status(201).json(
      formatResponse(
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          accessToken,
          refreshToken,
        },
        'Registration successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json(formatResponse(null, 'Invalid credentials', false));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(null, 'Invalid credentials', false));
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res.json(
      formatResponse(
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          accessToken,
          refreshToken,
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return res.json(formatResponse(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json(formatResponse(null, 'Refresh token required', false));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (_err) {
      return res.status(401).json(formatResponse(null, 'Invalid or expired refresh token', false));
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json(formatResponse(null, 'Refresh token mismatch', false));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.json(
      formatResponse({ accessToken, refreshToken: newRefreshToken }, 'Token refreshed')
    );
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json(formatResponse(null, 'User not found', false));
    }
    return res.json(formatResponse({ user }, 'Profile retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refreshToken, getProfile };
