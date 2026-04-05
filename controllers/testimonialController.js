const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        const createdTestimonial = await testimonial.save();
        res.status(201).json(createdTestimonial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
