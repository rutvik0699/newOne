const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderAnalytics,
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');
const { validateOrder, handleValidationErrors } = require('../middleware/validation');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.post('/', limiter, verifyToken, validateOrder, handleValidationErrors, createOrder);
router.get('/', limiter, verifyToken, getAllOrders);
router.get('/analytics/summary', limiter, verifyToken, getOrderAnalytics);
router.get('/:id', limiter, verifyToken, getOrderById);
router.put('/:id', limiter, verifyToken, updateOrder);
router.delete('/:id', limiter, verifyToken, deleteOrder);

module.exports = router;
