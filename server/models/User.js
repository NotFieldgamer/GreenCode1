const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Remember to hash this with bcrypt!
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    credits: { type: Number, default: 0 },
    creditsResetAt: { type: Date, default: null },
    displayCurrency: { type: String, default: 'USD' },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);