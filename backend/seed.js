const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const InventoryItem = require('./models/InventoryItem');
const BloodBag = require('./models/BloodBag');
const Alert = require('./models/Alert');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/mediflow';

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await InventoryItem.deleteMany({});
        await BloodBag.deleteMany({});
        await Alert.deleteMany({});
        console.log('Old data cleared');

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@mediflow.com',
            password: hashedPassword,
            role: 'Admin'
        });
        await adminUser.save();
        console.log('Admin user created (admin@mediflow.com / admin123)');

        // Seed Blood Bags
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const bloodBags = bloodGroups.map(group => ({
            bloodGroup: group,
            quantity: Math.floor(Math.random() * 50) + 5, // Random 5-55 units
            status: 'Available'
        }));
        await BloodBag.insertMany(bloodBags);
        console.log('Blood bags seeded');

        // Seed Medicines
        const medicines = [
            { name: 'Paracetamol', quantity: 500, unit: 'tablets', status: 'Available' },
            { name: 'Amoxicillin', quantity: 200, unit: 'capsules', status: 'Available' },
            { name: 'Ibuprofen', quantity: 300, unit: 'tablets', status: 'Available' },
            { name: 'Cetrizen', quantity: 150, unit: 'tablets', status: 'Available' },
            { name: 'Insulin', quantity: 50, unit: 'vials', status: 'Low Stock' },
            { name: 'Aspirin', quantity: 0, unit: 'tablets', status: 'Out of Stock' }
        ];
        await InventoryItem.insertMany(medicines.map(item => ({ ...item, category: 'Medicine' })));
        console.log('Medicines seeded');

        // Seed Equipment
        const equipment = [
            { name: 'Ventilator', quantity: 10, unit: 'units', status: 'Available', location: 'ICU' },
            { name: 'ECG Machine', quantity: 5, unit: 'units', status: 'Available', location: 'Cardiology' },
            { name: 'MRI Scanner', quantity: 1, unit: 'units', status: 'Available', location: 'Radiology' },
            { name: 'Wheelchair', quantity: 20, unit: 'units', status: 'Available', location: 'Emergency' },
            { name: 'Defibrillator', quantity: 3, unit: 'units', status: 'Low Stock', location: 'ER' }
        ];
        await InventoryItem.insertMany(equipment.map(item => ({ ...item, category: 'Equipment' })));
        console.log('Equipment seeded');

        // Seed Alerts
        const alerts = [
            { type: 'Critical', message: 'Low stock of O- Blood', category: 'Blood' },
            { type: 'Warning', message: 'Aspirin out of stock', category: 'Medicine' },
            { type: 'Info', message: 'New MRI Scanner installation scheduled', category: 'Equipment' }
        ];
        await Alert.insertMany(alerts);
        console.log('Alerts seeded');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('SEED ERROR:', JSON.stringify(err, null, 2));
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`Validation Error: ${key} -> ${err.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seedDatabase();
