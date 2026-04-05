const express = require('express');
const router = express.Router();
const {
    createBooking, getBookings, getBookingById,
    updateBookingStatus, updatePayment, deleteBooking
} = require('../controllers/bookingController');
const { protect, isManagerOrAdmin, isAdmin } = require('../middleware/auth');

// Public: create booking (guests)
router.post('/', createBooking);

// Public: used by payment gateway callback
router.put('/:id/payment', updatePayment);

// Protected: manager or admin
router.get('/', protect, isManagerOrAdmin, getBookings);
router.get('/:id', protect, isManagerOrAdmin, getBookingById);
router.patch('/:id/status', protect, isManagerOrAdmin, updateBookingStatus);

// Admin only
router.delete('/:id', protect, isAdmin, deleteBooking);

module.exports = router;
