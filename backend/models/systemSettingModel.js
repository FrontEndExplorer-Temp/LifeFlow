import mongoose from 'mongoose';

const systemSettingSchema = mongoose.Schema({
    isMaintenanceMode: {
        type: Boolean,
        default: false,
    },
    globalGeminiKey: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

export default SystemSetting;
