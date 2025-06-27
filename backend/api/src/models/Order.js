// backend/api/src/models/Order.js
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },   // frozen surname
  userPhone: { type: String, required: true },   // frozen phone
  userStreet: { type: String, required: true },   // frozen street
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },   // frozen name
      price: { type: Number, required: true },   // frozen price
      quantity: { type: Number, required: true }
    }
  ],
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
  contact: { type: String, required: true }
})

module.exports = mongoose.model('Order', orderSchema)
