const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    modules: {
        blood: { type: Boolean, default: true },
        medicine: { type: Boolean, default: true },
        equipment: { type: Boolean, default: true },
        alerts: { type: Boolean, default: true },
        help: { type: Boolean, default: true }
    },
    emergencyOverride: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
