import asyncHandler from 'express-async-handler';

const validateRegistration = (req, res, next) => {
    const { name, email, password, gender } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: name, email, password');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    // Password validation
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
    }

    // Gender validation (optional but must be valid if provided)
    if (gender && !['male', 'female'].includes(gender)) {
        res.status(400);
        throw new Error('Invalid gender. Must be "male" or "female"');
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    next();
};

const validateProfileUpdate = (req, res, next) => {
    const { email, gender } = req.body;

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Invalid email format');
        }
    }

    if (gender && !['male', 'female'].includes(gender)) {
        res.status(400);
        throw new Error('Invalid gender. Must be "male" or "female"');
    }

    next();
};

export { validateRegistration, validateLogin, validateProfileUpdate };
