// backend/controllers/productController.js
const Product = require('../models/Product')
const Order = require('../models/Order')
const cloudinary = require('../config/cloudinary')

// helper to upload buffer to Cloudinary
function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products', public_id: publicId, resource_type: 'image' },
      (error, result) => error ? reject(error) : resolve(result)
    )
    stream.end(buffer)
  })
}

exports.getAll = async (req, res) => {
  try {
    const docs = await Product.aggregate(
      [
        { $sort: { createdAt: -1 } },
        {
          $project: {
            name: 1,
            price: 1,
            category: 1,
            minOrder: 1,
            createdAt: 1,
            updatedAt: 1,
            image: 1
          }
        }
      ],
      { allowDiskUse: true }
    )
    const result = docs.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      minOrder: p.minOrder,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      image: p.image || null
    }))
    res.json(result)
  } catch (err) {
    console.error('productController.getAll error:', err)
    res.status(500).json({ msg: 'Помилка отримання товарів' })
  }
}

exports.create = async (req, res) => {
  try {
    const { name, price, category, minOrder } = req.body
    const data = {
      name,
      price: Number(price),
      category,
      minOrder: Number(minOrder)
    }
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, `${Date.now()}`)
      data.image = upload.secure_url
    }
    const prod = await new Product(data).save()
    res.status(201).json({
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      minOrder: prod.minOrder,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
      image: prod.image || null
    })
  } catch (err) {
    console.error('productController.create error:', err)
    res.status(500).json({ msg: 'Помилка створення товару' })
  }
}

exports.update = async (req, res) => {
  try {
    const { name, price, category, minOrder } = req.body
    const data = {
      name,
      price: Number(price),
      category,
      minOrder: Number(minOrder)
    }
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, req.params.id)
      data.image = upload.secure_url
    }
    const prod = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    )
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' })
    res.json({
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      minOrder: prod.minOrder,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
      image: prod.image || null
    })
  } catch (err) {
    console.error('productController.update error:', err)
    res.status(500).json({ msg: 'Помилка оновлення товару' })
  }
}

exports.remove = async (req, res) => {
  try {
    const { id } = req.params
    const prod = await Product.findById(id)
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' })
    await Order.updateMany(
      { 'products.productId': id },
      { $pull: { products: { productId: id } } }
    )
    await Order.deleteMany({ products: { $size: 0 } })
    await Product.findByIdAndDelete(id)
    res.json({ msg: 'Товар видалено, позицію прибрано з замовлень' })
  } catch (err) {
    console.error('productController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару' })
  }
}
