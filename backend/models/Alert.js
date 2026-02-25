const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Critical', 'Warning', 'Info'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String, // e.g., 'Blood', 'Equipment', 'Staff', 'Ambulance'
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetCoordinatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    targetAll: {
        type: Boolean,
        default: true
    },
    requesterEmail: {
        type: String
    },
    requesterName: {
        type: String
    },
    contactNumber: {
        type: String
    },
    location: {
        type: String
    },
    priority: {
        type: String,
        enum: ['Critical', 'High', 'Normal'],
        default: 'High'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Ambulance Dispatched', 'Arrived', 'Resolved'],
        default: 'Pending'
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', AlertSchema);
