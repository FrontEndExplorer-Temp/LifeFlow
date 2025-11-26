import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';
import { addXP, checkBadges, XP_REWARDS } from '../services/gamificationService.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
    const { company, role, status, location, salary, link, dateApplied, notes } = req.body;

    const job = await Job.create({
        user: req.user._id,
        company,
        role,
        status,
        location,
        salary,
        link,
        dateApplied,
        notes,
    });

    let gamification = {};
    try {
        const xpResult = await addXP(req.user._id, XP_REWARDS.JOB_APPLICATION);
        const newBadges = await checkBadges(req.user._id, 'JOB_ADD');
        gamification = { xpResult, newBadges };
    } catch (e) {
        console.error('Gamification error:', e);
    }

    res.status(201).json({ ...job.toObject(), gamification });
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // Ensure user owns the job
    if (job.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedJob);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (job.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await job.deleteOne();

    res.json({ message: 'Job removed' });
});

import axios from 'axios';
import * as cheerio from 'cheerio';

// ... existing imports

// @desc    Parse job link
// @route   POST /api/jobs/parse
// @access  Private
const parseJobLink = asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url) {
        res.status(400);
        throw new Error('Please provide a URL');
    }

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || '';
        const siteName = $('meta[property="og:site_name"]').attr('content') || '';

        let company = siteName;
        let role = title;
        let location = '';

        // LinkedIn specific
        if (url.includes('linkedin.com')) {
            if (title.includes(' at ')) {
                const parts = title.split(' at ');
                role = parts[0];
                company = parts[1].split(' | ')[0];
            }
        }

        // Naukri specific
        if (url.includes('naukri.com')) {
            if (title.includes(' - ')) {
                const parts = title.split(' - ');
                role = parts[0];
                if (parts.length > 1) company = parts[1];
                if (parts.length > 2) location = parts[2];
            }
        }

        res.json({
            role: role.trim(),
            company: company.trim(),
            location: location.trim(),
            description: description.trim(),
            link: url
        });
    } catch (error) {
        console.error('Error parsing URL:', error.message);
        res.status(400);
        throw new Error('Could not parse URL');
    }
});

export { getJobs, createJob, updateJob, deleteJob, parseJobLink };
