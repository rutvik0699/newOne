const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentOrders, getMonthlySales } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.get('/stats', verifyToken, getDashboardStats);
router.get('/recent-orders', verifyToken, getRecentOrders);
router.get('/monthly-sales', verifyToken, getMonthlySales);

module.exports = router;
