const Application = require('../models/Application');
const Job = require('../models/Job');

exports.createApplication = async (req, res) => {
    try {
        const job = await Job.findById(req.body.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        const existing = await Application.findOne({ job: req.body.jobId, applicant: req.user.id });
        if (existing) return res.status(400).json({ message: 'Already applied' });
        const app = new Application({ job: req.body.jobId, applicant: req.user.id, coverLetter: req.body.coverLetter, resume: req.file?.path });
        await app.save();
        res.status(201).json({ message: 'Application submitted', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting', error: error.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const apps = await Application.find().populate('applicant', 'name email').populate('job', 'title company').sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
};

exports.getApplicationsByJob = async (req, res) => {
    try {
        const apps = await Application.find({ job: req.params.jobId }).populate('applicant', 'name email phone').sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
};

exports.getUserApplications = async (req, res) => {
    try {
        const apps = await Application.find({ applicant: req.user.id }).populate('job').sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id).populate('job').populate('applicant', 'name email');
        if (!app) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(app);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching', error: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const app = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!app) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Status updated', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error updating', error: error.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: 'Not found' });
        if (app.applicant.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        await Application.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting', error: error.message });
    }
};
