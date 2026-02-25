const express = require('express');
const router = express.Router();
const BloodBag = require('../models/BloodBag');

// GET all blood bags
router.get('/', async (req, res) => {
    try {
        const bags = await BloodBag.find();
        res.json(bags);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new blood bag
router.post('/', async (req, res) => {
    const bag = new BloodBag(req.body);
    try {
        const newBag = await bag.save();
        res.status(201).json(newBag);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
