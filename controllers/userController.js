const User = require('../models/User');

// @desc    Get all manager/admin users
// @route   GET /admin/users
// @access  Admin only
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create a new manager/admin user
// @route   POST /admin/users
// @access  Admin only
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const user = await User.create({ name, email, password, role: role || 'manager' });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update user role or active status
// @route   PUT /admin/users/:id
// @access  Admin only
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from demoting themselves
        if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
            return res.status(400).json({ message: 'You cannot demote your own admin account' });
        }

        if (req.body.role) user.role = req.body.role;
        if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
        if (req.body.name) user.name = req.body.name;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete a user
// @route   DELETE /admin/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
