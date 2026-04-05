const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    guestDetails: {
        name: { type: String, required: true },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\d{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid 10-digit phone number!`
            }
        },
        address: String,
        email: String,
    },
    partyDetails: {
        adults: { type: Number, required: true },
        males: Number,
        females: Number,
        children: { type: Number, default: 0 },
        relation: String,
    },
    roomDetails: {
        roomNumber: { type: String, required: true },
        floor: String,
        roomType: String,
    },
    dates: {
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        nights: Number,
    },
    financials: {
        totalPrice: { type: Number, required: true },
        advancePaid: { type: Number, default: 0 },   // 20% paid online
        balanceDue: { type: Number, required: true }, // 80% at check-in
    },
    paymentMethod: {
        type: String,
        enum: ['eSewa', 'Khalti', 'Cash', 'Pending'],
        default: 'Pending',
    },
    transactionId: { type: String, default: '' }, // Gateway transaction reference
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid'],
        default: 'Pending',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'pending',
    },
    notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
