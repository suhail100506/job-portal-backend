const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    requirements: {
        type: String,
        required: [true, 'Job requirements are required']
    },
    salary: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'],
        default: 'Full Time'
    },
    category: {
        type: String,
        enum: ['Development', 'Design', 'Marketing', 'Project Management', 'Customer Services', 'Accounting / Finance', 'Sales', 'Healthcare', 'Education', 'Engineering', 'Other'],
        default: 'Other'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for faster searching
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
