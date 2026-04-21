const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Admin/Manager login
// @route   POST /admin/login
// @access  Public
exports.login = async (req, res) => {
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Body:', req.body);
    
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        console.log('Missing fields');
        return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    try {
        const user = await User.findOne({ email });
        console.log('Found User:', user ? { id: user._id, email: user.email, role: user.role, isActive: user.isActive } : 'null');

        if (!user || !user.isActive) {
            console.log('User not found or disabled');
            return res.status(401).json({ message: 'Invalid credentials or account disabled' });
        }

        if (user.role !== role) {
            console.log(`Role mismatch. Expected ${user.role}, got ${role}`);
            return res.status(401).json({ message: `Access denied for role: ${role}` });
        }

        const isMatch = await user.matchPassword(password);
        console.log('Password Match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get current logged-in user
// @route   GET /admin/me
// @access  Private
exports.getMe = async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
    });
};

// @desc    Update current user's profile (name, email, password)
// @route   PUT /api/admin/profile
// @access  Private (any logged-in admin/manager)
exports.updateProfile = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    try {
        const user = await require('../models/User').findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;

        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            user.password = password; // pre-save hook will hash it
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            message: 'Profile updated successfully',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Seed first admin (run once to bootstrap)
// @route   POST /admin/seed-admin
// @access  Public (should be disabled after setup)
exports.seedAdmin = async (req, res) => {
    try {
        const existing = await User.findOne({ role: 'admin' });
        if (existing) {
            return res.status(400).json({ message: 'Admin already exists. Use login.' });
        }

        const email = req.body?.email || 'admin@sneha.com';
        const password = req.body?.password || 'admin@123';

        const admin = await User.create({
            name: 'Admin',
            email,
            password,
            role: 'admin',
        });

        res.status(201).json({
            message: 'Admin created successfully',
            email: admin.email,
            role: admin.role,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
