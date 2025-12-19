const User = require('../models/User');
const { validationResult } = require('express-validator');

const sendToken = (user, code, res, msg) => {
    const token = user.generateToken();
    res.status(code).cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json({ success: true, message: msg, user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        const { name, email, password, role } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'User exists' });
        const user = await User.create({ name, email, password, role: role || 'jobseeker' });
        sendToken(user, 201, res, 'Registered successfully');
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Provide credentials' });
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        sendToken(user, 200, res, 'Login successful');
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = (req, res) => res.status(200).cookie('token', '', { httpOnly: true, expires: new Date(0) }).json({ success: true, message: 'Logged out' });

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};