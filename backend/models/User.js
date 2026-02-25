const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Provider', 'User'],
        default: 'User'
    },
    phone: {
        type: String
    },
    isDonor: {
        type: Boolean,
        default: false
    },
    bloodGroup: {
        type: String
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    donationHistory: [{
        date: Date,
        hospital: String,
        units: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
