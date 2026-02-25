const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');

// GET all Emergency Coordinators (Providers) for request targeting
router.get('/coordinators', async (req, res) => {
    try {
        const coordinators = await User.find({ role: 'Provider' })
            .select('_id name email phone')
            .sort({ name: 1 });
        res.json(coordinators);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a user (Admin/Testing)
router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password, // Note: In production, hash this!
        role: req.body.role || 'User'
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update User Profile
router.put('/profile/:id', async (req, res) => {
    try {
        const { bloodGroup, emergencyContact, name, phone } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bloodGroup) user.bloodGroup = bloodGroup;
        if (emergencyContact) user.emergencyContact = emergencyContact;
        if (req.body.isDonor !== undefined) user.isDonor = req.body.isDonor;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Profile (for testing/verification)
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Donation History
router.get('/donations/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.donationHistory || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Donation Record
router.post('/donations/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { date, hospital, units } = req.body;
        user.donationHistory.push({ date, hospital, units });

        await user.save();
        res.status(201).json(user.donationHistory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /donate - Submit a donation request
router.post('/donate', auth, async (req, res) => {
    try {
        const { bloodGroup, units, diseaseHistory, contactNumber, lastDonationDate, name } = req.body;

        // JWT only has id+role, not name — get name from body or fall back to DB lookup
        let donorName = name;
        if (!donorName) {
            const userDoc = await User.findById(req.user.id).select('name');
            donorName = userDoc?.name || 'Unknown';
        }

        const newRequest = new DonationRequest({
            userId: req.user.id,
            name: donorName,
            bloodGroup,
            units,
            diseaseHistory,
            contactNumber,
            lastDonationDate
        });

        await newRequest.save();

        // Create Alert for the User
        const userAlert = new Alert({
            type: 'Info',
            category: 'Donation',
            message: `Your donation request for ${bloodGroup} has been submitted successfully.`,
            userId: req.user.id,
            requesterName: donorName,
            status: 'Pending',
            priority: 'Normal'
        });
        await userAlert.save();

        // Create Alert for Admins/Providers
        const adminAlert = new Alert({
            type: 'Info',
            category: 'Donation',
            message: `New Donation Request: ${donorName} for ${bloodGroup}.`,
            requesterName: donorName,
            contactNumber: contactNumber,
            status: 'Pending',
            priority: 'Normal'
        });
        await adminAlert.save();

        res.status(201).json(newRequest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /my-requests - Get all requests (Alerts + Donations) for the user
router.get('/my-requests', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch alerts for this user
        const alerts = await Alert.find({
            $or: [
                { userId: userId },
                { requesterName: req.user.name || "" }
            ]
        }).sort({ createdAt: -1 });

        // Fetch donation requests for this user
        const donations = await DonationRequest.find({ userId: userId }).sort({ createdAt: -1 });

        // Merge and format
        const unified = [
            ...alerts.map(a => ({ ...a.toObject(), type: 'alert' })),
            ...donations.map(d => ({
                ...d.toObject(),
                type: 'donation',
                category: 'Donation',
                message: `Blood Donation Request (${d.bloodGroup}) - ${d.units} units`
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(unified);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE donation request
router.delete('/donation/:id', auth, async (req, res) => {
    try {
        const donation = await DonationRequest.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id // Ensure user can only delete their own
        });

        if (!donation) {
            return res.status(404).json({ message: 'Donation request not found' });
        }
        res.json({ message: 'Donation request deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
