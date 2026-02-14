const express = require('express');
const router = express.Router();
const axios = require('axios');
const { isAuthenticated } = require('../Middleware/AuthMiddleware');

// Proxy route to serve files with proper headers
router.get('/download/:type/:filename', isAuthenticated, async (req, res) => {
    try {
        const { type, filename } = req.params;
        const fileUrl = req.query.url;

        if (!fileUrl) {
            return res.status(400).json({ message: 'File URL is required' });
        }

        // Check if it's a Cloudinary URL
        if (fileUrl.startsWith('http')) {
            // Fetch file from Cloudinary
            const response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream'
            });

            // Determine content type based on file extension
            let contentType = 'application/octet-stream';
            if (filename.endsWith('.pdf')) {
                contentType = 'application/pdf';
            } else if (filename.endsWith('.doc')) {
                contentType = 'application/msword';
            } else if (filename.endsWith('.docx')) {
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }

            // Set headers for download
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `${type === 'view' ? 'inline' : 'attachment'}; filename="${filename}"`);
            
            // Pipe the file stream to response
            response.data.pipe(res);
        } else {
            // For local files
            const path = require('path');
            const fs = require('fs');
            const filePath = path.join(__dirname, '..', fileUrl);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'File not found' });
            }

            // Determine content type
            let contentType = 'application/octet-stream';
            if (filePath.endsWith('.pdf')) {
                contentType = 'application/pdf';
            } else if (filePath.endsWith('.doc')) {
                contentType = 'application/msword';
            } else if (filePath.endsWith('.docx')) {
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `${type === 'view' ? 'inline' : 'attachment'}; filename="${filename}"`);
            
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
});

module.exports = router;
