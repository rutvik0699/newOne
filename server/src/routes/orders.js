const express = require('express');
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

router.post('/', verifyToken, validateOrder, handleValidationErrors, createOrder);
router.get('/', verifyToken, getAllOrders);
router.get('/analytics/summary', verifyToken, getOrderAnalytics);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id', verifyToken, updateOrder);
router.delete('/:id', verifyToken, deleteOrder);

module.exports = router;
