const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createItem, getAllItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateItem, handleValidationErrors } = require('../middleware/validation');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.post('/', limiter, verifyToken, isAdmin, validateItem, handleValidationErrors, createItem);
router.get('/', limiter, getAllItems);
router.get('/:id', limiter, getItemById);
router.put('/:id', limiter, verifyToken, isAdmin, updateItem);
router.delete('/:id', limiter, verifyToken, isAdmin, deleteItem);

module.exports = router;
