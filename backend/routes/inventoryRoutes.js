const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');

// GET all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await InventoryItem.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET items by category (Medicine / Equipment)
router.get('/category/:category', async (req, res) => {
    try {
        const items = await InventoryItem.find({ category: req.params.category });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new item
router.post('/', async (req, res) => {
    const item = new InventoryItem(req.body);
    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
