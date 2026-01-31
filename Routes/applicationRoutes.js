const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { isAuthenticated, authorizeRoles } = require('../Middleware/AuthMiddleware');
const upload = require('../Middleware/uploadMiddleware');

// Create Application
router.post('/', isAuthenticated, upload.single('resume'), async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const existing = await Application.findOne({ job: jobId, applicant: req.user.id });
        if (existing) return res.status(400).json({ message: 'Already applied' });

        const app = new Application({
            job: jobId,
            applicant: req.user.id,
            coverLetter,
            resume: req.file ? req.file.path : null
        });

        await app.save();
        res.status(201).json({ message: 'Application submitted', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting', error: error.message });
    }
});

// Get User's Applications
router.get('/my-applications', isAuthenticated, async (req, res) => {
    try {
        const apps = await Application.find({ applicant: req.user.id }).populate('job').sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
});

// Get Application by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const app = await Application.findById(req.params.id).populate('job').populate('applicant', 'name email');
        if (!app) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(app);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
});

// Delete Application
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: 'Not found' });

        if (app.applicant.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Application.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting', error: error.message });
    }
});

// Get All Applications (Admin/Recruiter)
router.get('/', isAuthenticated, authorizeRoles('recruiter', 'employer', 'admin'), async (req, res) => {
    try {
        const apps = await Application.find().populate('applicant', 'name email').populate('job', 'title company').sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
});

// Get Applications for a Job (Admin/Recruiter)
router.get('/job/:jobId', isAuthenticated, authorizeRoles('recruiter', 'employer', 'admin'), async (req, res) => {
    try {
        const apps = await Application.find({ job: req.params.jobId }).populate('applicant', 'name email phone').sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
});

// Update Application Status
router.put('/:id/status', isAuthenticated, authorizeRoles('recruiter', 'employer', 'admin'), async (req, res) => {
    try {
        const app = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!app) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Status updated', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error updating', error: error.message });
    }
});

module.exports = router;
