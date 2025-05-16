const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageData: String,              // raw base64 or buffer
  imageType: String,              // e.g. 'image/png'
  minOrder: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Product', ProductSchema)