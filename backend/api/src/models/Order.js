// backend/api/src/models/Order.js
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // frozen user data
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userPhone: {
    type: String,
    required: true,
    trim: true
  },
  userStreet: {
    type: String,
    required: true,
    trim: true
  },

  // frozen products
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],

  // 🔐 ORDER TOTAL (CRITICAL)
  total: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  status: {
    type: String,
    enum: ['new', 'processing', 'done', 'cancelled'],
    default: 'new'
  },

  contact: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Order', orderSchema)
