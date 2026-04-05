const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, addRoom, updateRoom, deleteRoom, seedRooms, updateRoomImages } = require('../controllers/roomController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Admin-only routes
router.post('/', protect, isAdmin, addRoom);
router.post('/seed', protect, isAdmin, seedRooms);
router.put('/:id', protect, isAdmin, updateRoom);
router.delete('/:id', protect, isAdmin, deleteRoom);
router.patch('/:roomNumber/images', protect, isAdmin, updateRoomImages);

module.exports = router;
