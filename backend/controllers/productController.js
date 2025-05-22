// backend/controllers/productController.js

const Product = require('../models/Product')
const Order = require('../models/Order')

// Helper: build a data-URL from imageData + imageType
function toDataUrl({ imageData, imageType }) {
  if (!imageData || !imageType) return null
  return `data:${imageType};base64,${imageData}`
}

exports.getAll = async (req, res) => {
  // Read pagination params (defaults: page 1, 20 items)
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
  const skip = (page - 1) * limit

  try {
    // Total count for paging UI
    const total = await Product.countDocuments()

    // Use aggregation with allowDiskUse for large collections
    const docs = await Product.aggregate(
      [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            price: 1,
            category: 1,
            minOrder: 1,
            createdAt: 1,
            imageData: 1,
            imageType: 1
          }
        }
      ],
      { allowDiskUse: true }
    )

    // Map to API shape
    const data = docs.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      minOrder: p.minOrder,
      createdAt: p.createdAt,
      image: toDataUrl(p)
    }))

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data
    })
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
      data.imageData = req.file.buffer.toString('base64')
      data.imageType = req.file.mimetype
    }
    const prod = await new Product(data).save()
    res.status(201).json({
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      minOrder: prod.minOrder,
      createdAt: prod.createdAt,
      image: toDataUrl(prod)
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
      data.imageData = req.file.buffer.toString('base64')
      data.imageType = req.file.mimetype
    }
    const prod = await Product.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' })
    res.json({
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      minOrder: prod.minOrder,
      createdAt: prod.createdAt,
      image: toDataUrl(prod)
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

    // Remove this product from any orders
    await Order.updateMany(
      { 'products.productId': id },
      { $pull: { products: { productId: id } } }
    )
    // Delete orders now empty
    await Order.deleteMany({ products: { $size: 0 } })
    // Finally delete the product
    await Product.findByIdAndDelete(id)

    res.json({ msg: 'Товар видалено, позицію прибрано з замовлень' })
  } catch (err) {
    console.error('productController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару' })
  }
}
