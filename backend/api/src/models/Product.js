const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },

  // ✅ Wholesale price (оптова ціна)
  wholesalePrice: {
    type: Number,
    default: null
  },

  // ✅ Minimum qty for wholesale
  wholesaleMinQty: {
    type: Number,
    default: null
  },

  category: { type: String, required: true },

  // minimum order allowed (not wholesale, just order restriction)
  minOrder: { type: Number, required: true, default: 1 },

  image: { type: String },

}, {
  timestamps: true
});

ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
