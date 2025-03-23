const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['USER', 'PREMIUM_USER', 'ADMIN'], default: 'USER' },
    passwordHash: { type: String, required: true },
    accountExpiration: { type: Number, required: true },
    blocked: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;