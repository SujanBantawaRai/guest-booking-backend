const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
    },
    floor: {
        type: String, // "First", "Second", "Third"
        required: true,
    },
    type: {
        type: String,
        enum: ['Deluxe Room A', 'Common Room', 'Standard Room'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    amenities: [String],
    images: [String],
    isAvailable: {
        type: Boolean,
        default: true,
    },
    description: String,
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
