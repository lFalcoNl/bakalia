const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  surname: { type: String, required: true },               // Прізвище
  street: { type: String, required: true },               // Вулиця
  phone: { type: String, required: true, unique: true }, // Номер телефону
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: false },              // Адмін підтверджує
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('User', userSchema);
