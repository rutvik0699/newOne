const express = require('express');
const router = express.Router();
const { createItem, getAllItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateItem, handleValidationErrors } = require('../middleware/validation');

router.post('/', verifyToken, isAdmin, validateItem, handleValidationErrors, createItem);
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.put('/:id', verifyToken, isAdmin, updateItem);
router.delete('/:id', verifyToken, isAdmin, deleteItem);

module.exports = router;
