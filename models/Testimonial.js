const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    guestName: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
