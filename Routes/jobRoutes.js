const express = require('express');
const router = express.Router();
const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    searchJobs
} = require('../Controller/jobController');
const { isAuthenticated, authorizeRoles } = require('../Middleware/AuthMiddleware');

router.get('/', getAllJobs);
router.get('/search', searchJobs);
router.get('/:id', getJobById);
router.post('/', isAuthenticated, authorizeRoles('recruiter', 'admin'), createJob);
router.put('/:id', isAuthenticated, authorizeRoles('recruiter', 'admin'), updateJob);
router.delete('/:id', isAuthenticated, authorizeRoles('recruiter', 'admin'), deleteJob);

module.exports = router;
