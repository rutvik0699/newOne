const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrder, deleteOrder, filterByDate } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

router.get('/filter/by-date', authenticate, filterByDate);
router.post('/', authenticate, orderValidation, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id', authenticate, updateOrder);
router.delete('/:id', authenticate, deleteOrder);

module.exports = router;
