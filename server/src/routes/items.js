const express = require('express');
const router = express.Router();
const { createItem, getItems, getItem, updateItem, deleteItem } = require('../controllers/itemController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { itemValidation } = require('../middleware/validation');

router.post('/', authenticate, requireAdmin, itemValidation, createItem);
router.get('/', authenticate, getItems);
router.get('/:id', authenticate, getItem);
router.put('/:id', authenticate, requireAdmin, updateItem);
router.delete('/:id', authenticate, requireAdmin, deleteItem);

module.exports = router;
