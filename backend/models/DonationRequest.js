const mongoose = require('mongoose');

const DonationRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true
    },
    units: {
        type: Number,
        default: 1
    },
    diseaseHistory: {
        type: [String],
        default: []
    },
    contactNumber: {
        type: String,
        required: true
    },
    lastDonationDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    scheduledDate: {
        type: Date
    },
    adminNotes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DonationRequest', DonationRequestSchema);
