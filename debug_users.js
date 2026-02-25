const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/mediflow';

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({});
        console.log('Total users:', users.length);
        const roles = {};
        users.forEach(u => {
            roles[u.role] = (roles[u.role] || 0) + 1;
        });
        console.log('Roles breakdown:', roles);

        console.log('User details (first 10):');
        users.slice(0, 10).forEach(u => {
            console.log(`- ${u.name} (${u.email}): ${u.role}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
