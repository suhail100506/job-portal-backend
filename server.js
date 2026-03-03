const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const app = express();

/* 🔥 VERY IMPORTANT: CORS MUST BE FIRST */
app.use(cors({
    origin: [
        'https://job-portal-frontend-je9k.vercel.app',
        'http://localhost:5173',
        'http://localhost:4173'
    ],
    credentials: true
}));

// 🔥 Handle preflight explicitly
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/jobs', require('./Routes/jobRoutes'));
app.use('/api/applications', require('./Routes/applicationRoutes'));
app.use('/api/users', require('./Routes/userRoutes'));
app.use('/api/files', require('./Routes/fileRoutes'));

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

// Start server after DB connection
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();