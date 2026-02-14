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

        // Decode the filename
        const decodedFilename = decodeURIComponent(filename);
        
        // Extract extension from URL if filename doesn't have one
        let finalFilename = decodedFilename;
        if (!decodedFilename.match(/\.(pdf|doc|docx)$/i)) {
            const urlExtension = fileUrl.match(/\.(pdf|doc|docx)(\?|$)/i);
            if (urlExtension) {
                finalFilename = `${decodedFilename}${urlExtension[1]}`;
            }
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
            const extension = finalFilename.toLowerCase();
            if (extension.endsWith('.pdf')) {
                contentType = 'application/pdf';
            } else if (extension.endsWith('.doc')) {
                contentType = 'application/msword';
            } else if (extension.endsWith('.docx')) {
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }

            // Set headers for download with proper filename encoding
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `${type === 'view' ? 'inline' : 'attachment'}; filename="${finalFilename}"; filename*=UTF-8''${encodeURIComponent(finalFilename)}`);
            
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
            const extension = finalFilename.toLowerCase();
            if (extension.endsWith('.pdf')) {
                contentType = 'application/pdf';
            } else if (extension.endsWith('.doc')) {
                contentType = 'application/msword';
            } else if (extension.endsWith('.docx')) {
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `${type === 'view' ? 'inline' : 'attachment'}; filename="${finalFilename}"; filename*=UTF-8''${encodeURIComponent(finalFilename)}`);
            
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
});

module.exports = router;
