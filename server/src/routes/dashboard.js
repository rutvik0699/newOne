const express = require('express');
const router = express.Router();
const { getStats, getRecentOrders, getMonthlyRevenue, getOrderStatus } = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, requireAdmin, getStats);
router.get('/recent-orders', authenticate, requireAdmin, getRecentOrders);
router.get('/monthly-revenue', authenticate, requireAdmin, getMonthlyRevenue);
router.get('/order-status', authenticate, requireAdmin, getOrderStatus);

module.exports = router;
