const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sneha-guest-house')
    .then(async () => {
        console.log('Connected to DB. Updating prices...');

        await Room.deleteMany();

        const rooms = [
            { number: '101', floor: 'First', type: 'Deluxe Room A', price: 1100, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room101-1.jpg', '/images/rooms/room101-2.jpg', '/images/rooms/room101-3.jpg'] },
            { number: '102', floor: 'First', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room102-1.jpg', '/images/rooms/room102-2.jpg'] },
            { number: '103', floor: 'First', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room103-1.jpg', '/images/rooms/room103-2.jpg', '/images/rooms/room103-3.jpg'] },
            { number: '104', floor: 'First', type: 'Standard Room', price: 800, amenities: ['Wifi', 'Attached Bathroom'], isAvailable: true, images: ['/images/rooms/room104-1.jpg', '/images/rooms/room104-2.jpg', '/images/rooms/room104-3.jpg'] },
            { number: '105', floor: 'First', type: 'Deluxe Room A', price: 1500, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room105-1.jpg', '/images/rooms/room105-2.jpg', '/images/rooms/room105-3.jpg', '/images/rooms/room105-4.jpg'] },
            { number: '201', floor: 'Second', type: 'Deluxe Room A', price: 1100, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room101-1.jpg', '/images/rooms/room101-2.jpg', '/images/rooms/room101-3.jpg'] },
            { number: '202', floor: 'Second', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room102-1.jpg', '/images/rooms/room102-2.jpg'] },
            { number: '204', floor: 'Second', type: 'Deluxe Room A', price: 1300, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room204-1.jpg', '/images/rooms/room204-2.jpg', '/images/rooms/room204-3.jpg'] },
            { number: '205', floor: 'Second', type: 'Deluxe Room A', price: 1500, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room205-1.jpg', '/images/rooms/room205-2.jpg', '/images/rooms/room205-3.jpg', '/images/rooms/room205-4.jpg'] },
            { number: '301', floor: 'Third', type: 'Deluxe Room A', price: 1100, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room301-1.jpg', '/images/rooms/room301-2.jpg', '/images/rooms/room301-3.jpg'] },
            { number: '302', floor: 'Third', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room302-1.jpg', '/images/rooms/room302-2.jpg'] },
            { number: '303', floor: 'Third', type: 'Common Room', price: 600, amenities: ['Wifi', 'Shared Bathroom'], isAvailable: true, images: ['/images/rooms/room303-1.jpg', '/images/rooms/room303-2.jpg', '/images/rooms/room303-3.jpg'] },
            { number: '304', floor: 'Third', type: 'Standard Room', price: 800, amenities: ['Wifi', 'Attached Bathroom'], isAvailable: true, images: ['/images/rooms/room104-1.jpg', '/images/rooms/room104-2.jpg', '/images/rooms/room104-3.jpg'] },
            { number: '305', floor: 'Third', type: 'Deluxe Room A', price: 1500, amenities: ['TV', 'Attached Bathroom', 'Wifi'], isAvailable: true, images: ['/images/rooms/room305-1.jpg', '/images/rooms/room305-2.jpg', '/images/rooms/room305-3.jpg', '/images/rooms/room305-4.jpg'] },
        ];

        await Room.insertMany(rooms.map(r => ({
            roomNumber: r.number,
            floor: r.floor,
            type: r.type,
            price: r.price,
            amenities: r.amenities,
            images: r.images,
            description: `Comfortable ${r.type} on the ${r.floor} floor.`
        })));

        console.log('✅ Rooms updated successfully with new prices!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
