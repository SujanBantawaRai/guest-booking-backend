const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Add a new room
// @route   POST /api/rooms
// @access  Private (Admin)
exports.addRoom = async (req, res) => {
    try {
        const { roomNumber, floor, type, price, amenities, images, description, isAvailable } = req.body;
        const exists = await Room.findOne({ roomNumber });
        if (exists) return res.status(400).json({ message: 'Room number already exists' });

        const room = await Room.create({ roomNumber, floor, type, price, amenities, images, description, isAvailable });
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Seed rooms (Initial setup)
// @route   POST /api/rooms/seed
// @access  Public (should be protected in prod)
exports.seedRooms = async (req, res) => {
    try {
        await Room.deleteMany();

        const rooms = [
            { number: '101', floor: 'First', type: 'Deluxe Room A', price: 1000, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room101-1.jpg', '/images/rooms/room101-2.jpg', '/images/rooms/room101-3.jpg'] },
            { number: '102', floor: 'First', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room102-1.jpg', '/images/rooms/room102-2.jpg'] },
            { number: '103', floor: 'First', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room103-1.jpg', '/images/rooms/room103-2.jpg', '/images/rooms/room103-3.jpg'] },
            { number: '104', floor: 'First', type: 'Standard Room', price: 800, amenities: ['Wifi', 'Attached Bathroom'], isAvailable: true, images: ['/images/rooms/room104-1.jpg', '/images/rooms/room104-2.jpg', '/images/rooms/room104-3.jpg'] },
            { number: '105', floor: 'First', type: 'Deluxe Room A', price: 1500, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room105-1.jpg', '/images/rooms/room105-2.jpg', '/images/rooms/room105-3.jpg', '/images/rooms/room105-4.jpg'] },
            { number: '201', floor: 'Second', type: 'Deluxe Room A', price: 1000, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room101-1.jpg', '/images/rooms/room101-2.jpg', '/images/rooms/room101-3.jpg'] },
            { number: '202', floor: 'Second', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room102-1.jpg', '/images/rooms/room102-2.jpg'] },
            { number: '204', floor: 'Second', type: 'Deluxe Room A', price: 1300, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room204-1.jpg', '/images/rooms/room204-2.jpg', '/images/rooms/room204-3.jpg'] },
            { number: '205', floor: 'Second', type: 'Deluxe Room A', price: 1500, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room205-1.jpg', '/images/rooms/room205-2.jpg', '/images/rooms/room205-3.jpg', '/images/rooms/room205-4.jpg'] },
            { number: '301', floor: 'Third', type: 'Deluxe Room A', price: 1000, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room301-1.jpg', '/images/rooms/room301-2.jpg', '/images/rooms/room301-3.jpg'] },
            { number: '302', floor: 'Third', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room302-1.jpg', '/images/rooms/room302-2.jpg'] },
            { number: '303', floor: 'Third', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room303-1.jpg', '/images/rooms/room303-2.jpg', '/images/rooms/room303-3.jpg'] },
            { number: '304', floor: 'Third', type: 'Standard Room', price: 800, amenities: ['Wifi', 'Attached Bathroom'], isAvailable: true, images: ['/images/rooms/room104-1.jpg', '/images/rooms/room104-2.jpg', '/images/rooms/room104-3.jpg'] },
            { number: '305', floor: 'Third', type: 'Deluxe Room A', price: 1500, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room305-1.jpg', '/images/rooms/room305-2.jpg', '/images/rooms/room305-3.jpg', '/images/rooms/room305-4.jpg'] },
        ];

        const createdRooms = await Room.insertMany(rooms.map(r => ({
            roomNumber: r.number,
            floor: r.floor,
            type: r.type,
            price: r.price,
            amenities: r.amenities,
            images: r.images || ['https://placehold.co/600x400?text=' + r.type.replace(/ /g, '+')],
            description: `Comfortable ${r.type} on the ${r.floor} floor.`
        })));

        res.status(201).json(createdRooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update images for a specific room by roomNumber
// @route   PATCH /api/rooms/:roomNumber/images
// @access  Private (Admin)
exports.updateRoomImages = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const { images } = req.body;
        const room = await Room.findOneAndUpdate(
            { roomNumber },
            { $set: { images } },
            { new: true }
        );
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
