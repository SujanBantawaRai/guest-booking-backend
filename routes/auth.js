const express = require('express');
const router = express.Router();
const { login, getMe, seedAdmin, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', login);

// GET /api/admin/me (protected)
router.get('/me', protect, getMe);

// PUT /api/admin/profile (protected)
router.put('/profile', protect, updateProfile);

// POST /api/admin/seed-admin (bootstrap only — disable in production)
router.post('/seed-admin', seedAdmin);

module.exports = router;
