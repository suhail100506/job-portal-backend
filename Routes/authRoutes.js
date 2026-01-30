const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../Middleware/AuthMiddleware');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter all fields' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = await User.create({ name, email, password, role: role || 'jobseeker' });
        const token = user.generateToken();

        res.status(201).cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = user.generateToken();

        res.status(200).cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Logout User
router.get('/logout', (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Get Current User
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;