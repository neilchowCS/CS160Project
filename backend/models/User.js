const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  challengeCount: { type: Number, default: 0 },
  lastChallengeCompletedOn: { type: Date, default: null },
  avatarUrl: { type: String, default: null },
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

module.exports = { User };
