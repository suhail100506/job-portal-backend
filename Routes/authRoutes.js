const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../Controller/authController');
const { isAuthenticated } = require('../Middleware/AuthMiddleware');

const router = express.Router();

const validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters')
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/logout', logout);
router.get('/me', isAuthenticated, getMe);

module.exports = router;