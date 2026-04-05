const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
    try {
        const { guestDetails, partyDetails, roomDetails, dates, notes } = req.body;

        // Calculate nights
        const checkIn = new Date(dates.checkIn);
        const checkOut = new Date(dates.checkOut);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Calculate Prices
        const room = await Room.findOne({ roomNumber: roomDetails.roomNumber });
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const totalPrice = room.price * nights;
        const advanceAmount = Math.round(totalPrice * 0.2);  // 20% advance
        const balanceDue = totalPrice - advanceAmount;        // 80% at check-in

        const booking = new Booking({
            guestDetails,
            partyDetails,
            roomDetails: {
                ...roomDetails,
                roomType: room.type,
                floor: room.floor
            },
            dates: {
                ...dates,
                nights
            },
            financials: {
                totalPrice,
                balanceDue,
                advancePaid: 0
            },
            status: 'pending',
            notes
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Manager or Admin)
exports.getBookings = async (req, res) => {
    try {
        const filter = {};

        // Filter by status
        if (req.query.status) filter.status = req.query.status;

        // Search by guest name or phone
        if (req.query.search) {
            const s = req.query.search;
            filter.$or = [
                { 'guestDetails.name': { $regex: s, $options: 'i' } },
                { 'guestDetails.phone': { $regex: s, $options: 'i' } },
                { 'roomDetails.roomNumber': { $regex: s, $options: 'i' } },
            ];
        }

        const bookings = await Booking.find(filter).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get Single Booking
// @route   GET /api/bookings/:id
// @access  Private (Manager or Admin)
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Manager or Admin)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update Payment Status
// @route   PUT /api/bookings/:id/payment
// @access  Public (payment gateway callback)
exports.updatePayment = async (req, res) => {
    try {
        const { amount, method } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.financials.advancePaid += Number(amount);
            booking.financials.balanceDue = booking.financials.totalPrice - booking.financials.advancePaid;
            booking.paymentStatus = booking.financials.balanceDue <= 0 ? 'Paid' : 'Partial';
            if (method) booking.paymentMethod = method;

            // Auto-confirm booking once payment is made
            if (booking.status === 'pending') booking.status = 'confirmed';

            await booking.save();
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
