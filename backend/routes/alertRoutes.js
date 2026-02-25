const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// GET all alerts (optionally filtered for a specific coordinator)
router.get('/', async (req, res) => {
    try {
        const { coordinatorId } = req.query;
        let query = {};
        if (coordinatorId) {
            // Coordinator sees: requests targeted at them OR broadcast to all
            query = {
                $or: [
                    { targetCoordinatorId: coordinatorId },
                    { targetAll: true }
                ],
                category: { $ne: 'System' } // exclude internal system notifications
            };
        }
        const alerts = await Alert.find(query).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new alert (Emergency Request)
router.post('/', async (req, res) => {
    const alert = new Alert({
        type: req.body.type || 'Critical',
        message: req.body.message,
        category: req.body.category || 'Emergency',
        userId: req.body.userId,
        targetCoordinatorId: req.body.targetCoordinatorId || null,
        targetAll: req.body.targetAll !== undefined ? req.body.targetAll : true,
        requesterEmail: req.body.requesterEmail || '',
        requesterName: req.body.requesterName,
        contactNumber: req.body.contactNumber,
        location: req.body.location,
        priority: req.body.priority || 'High',
        isResolved: false
    });

    try {
        const newAlert = await alert.save();
        res.status(201).json(newAlert);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update alert status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        alert.status = status;
        if (status === 'Resolved') {
            alert.isResolved = true;
        }

        const updatedAlert = await alert.save();

        // SIMULATED SMS DISPATCH
        if (updatedAlert.contactNumber) {
            console.log(`\n--- [SIMULATED SMS] ---`);
            console.log(`TO: ${updatedAlert.contactNumber}`);
            console.log(`MESSAGE: MediFlow Update - Your help request [${updatedAlert._id.toString().slice(-6)}] is now: ${status}.`);
            console.log(`-----------------------\n`);
        }

        // INTERNAL NOTIFICATION (if userId exists)
        if (updatedAlert.userId) {
            const systemNotice = new Alert({
                type: status === 'Resolved' ? 'Info' : 'Warning',
                message: `Status Update: Your emergency request for ${updatedAlert.category} is now ${status}.`,
                category: 'System',
                userId: updatedAlert.userId,
                requesterName: "MediFlow System",
                priority: 'Normal',
                status: 'Resolved',
                isResolved: true
            });
            await systemNotice.save();
        }

        res.json(updatedAlert);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE alert
router.delete('/:id', async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        res.json({ message: 'Alert deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
