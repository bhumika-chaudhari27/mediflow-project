const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Medicine', 'Equipment'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String, // e.g., 'tablets', 'bottles', 'machines'
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Low Stock', 'Out of Stock'],
        default: 'Available'
    },
    expiryDate: {
        type: Date
    },
    location: {
        type: String // e.g., 'ICU', 'Pharmacy', 'Storage A'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
