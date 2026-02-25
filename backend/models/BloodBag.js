const mongoose = require('mongoose');

const BloodBagSchema = new mongoose.Schema({
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    quantity: {
        type: Number, // in units/bags
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Available', 'Critical', 'Empty'],
        default: 'Available'
    },
    location: {
        type: String,
        default: 'Blood Bank'
    },
    expiryDate: {
        type: Date
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BloodBag', BloodBagSchema);
