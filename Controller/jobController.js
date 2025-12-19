const Job = require('../models/Job');

exports.createJob = async (req, res) => {
    try {
        const job = new Job({ ...req.body, postedBy: req.user.id });
        await job.save();
        res.status(201).json({ message: 'Job posted', job });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error: error.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Job updated', job: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};

exports.searchJobs = async (req, res) => {
    try {
        const { keyword, location, type, category } = req.query;
        let query = {};
        if (keyword) query.$or = [{ title: { $regex: keyword, $options: 'i' } }, { description: { $regex: keyword, $options: 'i' } }, { company: { $regex: keyword, $options: 'i' } }];
        if (location) query.location = { $regex: location, $options: 'i' };
        if (type) query.type = type;
        if (category) query.category = category;
        const jobs = await Job.find(query).populate('postedBy', 'name').sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error searching jobs', error: error.message });
    }
};
