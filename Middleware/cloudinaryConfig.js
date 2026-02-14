const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.ds0diffpy,
    api_key: process.env.814319549227268,
    api_secret: process.env.NRPndOrT5sdSolC7tMqi0efE9t0
});

// Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'job-portal-resumes',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw', // For non-image files like PDFs
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `resume-${uniqueSuffix}`;
        }
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
