const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { getDashboardStats, getRecentOrders, getMonthlySales } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.get('/stats', limiter, verifyToken, getDashboardStats);
router.get('/recent-orders', limiter, verifyToken, getRecentOrders);
router.get('/monthly-sales', limiter, verifyToken, getMonthlySales);

module.exports = router;
