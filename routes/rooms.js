const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, addRoom, updateRoom, deleteRoom, seedRooms, updateRoomImages } = require('../controllers/roomController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);

// Admin-only routes
router.post('/seed', protect, isAdmin, seedRooms);
router.post('/', protect, isAdmin, addRoom);
router.patch('/:roomNumber/images', protect, isAdmin, updateRoomImages);
router.put('/:id', protect, isAdmin, updateRoom);
router.delete('/:id', protect, isAdmin, deleteRoom);

// Keep this LAST
router.get('/:id', getRoomById);

module.exports = router;
