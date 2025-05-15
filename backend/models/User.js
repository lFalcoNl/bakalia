const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date }
});

module.exports = model('User', userSchema);
