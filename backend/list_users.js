const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediflow';

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({}, { password: 0 });
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listUsers();
