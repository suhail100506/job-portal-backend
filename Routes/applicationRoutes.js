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
const { isAuthenticated, authorizeRoles } = require('../Middleware/AuthMiddleware');
const upload = require('../Middleware/uploadMiddleware');

router.post('/', isAuthenticated, upload.single('resume'), createApplication);
router.get('/my-applications', isAuthenticated, getUserApplications);
router.get('/:id', isAuthenticated, getApplicationById);
router.delete('/:id', isAuthenticated, deleteApplication);

router.get('/', isAuthenticated, authorizeRoles('recruiter', 'admin'), getAllApplications);
router.get('/job/:jobId', isAuthenticated, authorizeRoles('recruiter', 'admin'), getApplicationsByJob);
router.put('/:id/status', isAuthenticated, authorizeRoles('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
