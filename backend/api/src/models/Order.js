const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
  contact: { type: String }
})

module.exports = mongoose.model('Order', orderSchema)
