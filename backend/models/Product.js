const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  imageData: String,
  imageType: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Product', ProductSchema)
