// backend/api/src/controllers/productController.js
const Product = require('../models/Product')
const Order = require('../models/Order')
const cloudinary = require('../config/cloudinary')
const Busboy = require('busboy')
const { toUrlSafeSlug } = require('../utils/slug') // your slug helper

// GET /api/products[?category=slug]
exports.getAll = async (req, res) => {
  try {
    let products = await Product.find().sort({ createdAt: -1 })
    if (req.query.category) {
      const slug = req.query.category
      products = products.filter(p => toUrlSafeSlug(p.category) === slug)
    }
    res.json(products)
  } catch (err) {
    console.error('productController.getAll error:', err)
    res.status(500).json({ msg: 'Помилка отримання товарів' })
  }
}

// GET /api/products/:id
exports.getById = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id)
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' })
    res.json(prod)
  } catch (err) {
    console.error('productController.getById error:', err)
    res.status(500).json({ msg: 'Помилка отримання товару' })
  }
}

// GET /api/products/category/:slug
exports.getByCategory = async (req, res) => {
  try {
    const { slug } = req.params
    const all = await Product.find().sort({ createdAt: -1 })
    const filtered = all.filter(p => toUrlSafeSlug(p.category) === slug)
    res.json(filtered)
  } catch (err) {
    console.error('productController.getByCategory error:', err)
    res.status(500).json({ msg: 'Помилка отримання категорії' })
  }
}

// shared create & update handler
async function handleUpsert(req, res, isUpdate = false) {
  const contentType = req.headers['content-type'] || ''
  const isMultipart = contentType.includes('multipart/form-data')
  let fields = {}
  let uploadPromise = null

  if (!isMultipart) {
    fields = req.body
  } else {
    const bb = Busboy({ headers: req.headers })
    bb.on('field', (name, val) => { fields[name] = val })
    bb.on('file', (name, fileStream) => {
      if (name === 'image') {
        const publicId = isUpdate ? req.params.id : Date.now().toString()
        uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'products', public_id: publicId, resource_type: 'image' },
            (error, result) => error ? reject(error) : resolve(result.secure_url)
          )
          fileStream.pipe(uploadStream)
        })
      } else {
        fileStream.resume()
      }
    })
    req.pipe(bb)
    await new Promise(resolve => bb.on('finish', resolve))
    if (uploadPromise) fields.image = await uploadPromise
  }

  try {
    const data = {
      name: fields.name,
      price: Number(fields.price),
      category: fields.category,
      minOrder: Number(fields.minOrder)
    }
    if (fields.image) data.image = fields.image

    let product
    if (isUpdate) {
      product = await Product.findByIdAndUpdate(
        req.params.id, data, { new: true, runValidators: true }
      )
      if (!product) return res.status(404).json({ msg: 'Товар не знайдено' })
      return res.json(product)
    } else {
      product = await new Product(data).save()
      return res.status(201).json(product)
    }
  } catch (err) {
    console.error(`productController.${isUpdate ? 'update' : 'create'} error:`, err)
    return res.status(500).json({
      msg: isUpdate ? 'Помилка оновлення товару' : 'Помилка створення товару'
    })
  }
}

exports.create = (req, res) => handleUpsert(req, res, false)
exports.update = (req, res) => handleUpsert(req, res, true)

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id)
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' })

    if (prod.image) {
      const parts = prod.image.split('/')
      const filename = parts.pop()               // e.g. "123456789.jpg"
      const folder = parts.pop()               // e.g. "products"
      const publicId = `${folder}/${filename.split('.').shift()}`
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    }

    await Order.updateMany(
      { 'products.productId': prod._id },
      { $pull: { products: { productId: prod._id } } }
    )
    await Order.deleteMany({ products: { $size: 0 } })

    await prod.deleteOne()
    res.json({ msg: 'Товар і зображення видалені' })
  } catch (err) {
    console.error('productController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару' })
  }
}
