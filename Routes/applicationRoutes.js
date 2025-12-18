const express = require('express');
const router = express.Router();
const {
    createApplication,
    getAllApplications,
    getApplicationsByJob,
    getUserApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication
} = require('../Controller/applicationController');
const { protect, authorize } = require('../Middleware/AuthMiddleware');
const upload = require('../Middleware/uploadMiddleware');

// Protected routes - all require authentication
router.post('/', protect, upload.single('resume'), createApplication);
router.get('/my-applications', protect, getUserApplications);
router.get('/:id', protect, getApplicationById);
router.delete('/:id', protect, deleteApplication);

// Admin/Employer routes
router.get('/', protect, authorize('employer', 'admin'), getAllApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getApplicationsByJob);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
