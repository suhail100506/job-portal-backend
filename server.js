const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/jobs', require('./Routes/jobRoutes'));
app.use('/api/applications', require('./Routes/applicationRoutes'));
app.use('/api/users', require('./Routes/userRoutes'));

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Job Portal API is running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});