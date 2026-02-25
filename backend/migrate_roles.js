const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow';

async function migrateRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Update 'Staff' to 'Provider'
        const staffUpdate = await User.updateMany(
            { role: 'Staff' },
            { $set: { role: 'Provider' } }
        );
        console.log(`Updated ${staffUpdate.modifiedCount} users from 'Staff' to 'Provider'`);

        // Update 'Viewer' to 'User'
        const viewerUpdate = await User.updateMany(
            { role: 'Viewer' },
            { $set: { role: 'User' } }
        );
        console.log(`Updated ${viewerUpdate.modifiedCount} users from 'Viewer' to 'User'`);

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateRoles();
