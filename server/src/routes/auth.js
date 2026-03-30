const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/logout', verifyToken, logout);
router.post('/refresh', refreshToken);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
