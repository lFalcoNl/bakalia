// backend/models/Product.js
const mongoose = require('mongoose')
const { Schema } = mongoose

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageData: String,               // raw base64 string
  imageType: String,               // e.g. 'image/png'
  minOrder: { type: Number, required: true, default: 1 }
}, {
  timestamps: true  // adds createdAt and updatedAt
})

// index for efficient sorting by creation date
ProductSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Product', ProductSchema)
