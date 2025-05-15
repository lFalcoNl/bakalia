const Product = require('../models/Product')
const Order = require('../models/Order')

function toDataUrl({ imageData, imageType }) {
  if (!imageData || !imageType) return null
  return `data:${imageType};base64,${imageData}`
}

exports.getAll = async (req, res) => {
  const list = await Product.find().sort({ createdAt: -1 })
  res.json(list.map(p => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    category: p.category,
    code: p.code,
    image: toDataUrl(p)
  })))
}

exports.create = async (req, res) => {
  const data = {
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    code: req.body.code
  }
  if (req.file) {
    data.imageData = req.file.buffer.toString('base64')
    data.imageType = req.file.mimetype
  }
  const prod = await new Product(data).save()
  const out = prod.toObject()
  out.image = toDataUrl(prod)
  res.json(out)
}

exports.update = async (req, res) => {
  const data = {
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    code: req.body.code
  }
  if (req.file) {
    data.imageData = req.file.buffer.toString('base64')
    data.imageType = req.file.mimetype
  }
  const prod = await Product.findByIdAndUpdate(req.params.id, data, { new: true })
  const out = prod.toObject()
  out.image = toDataUrl(prod)
  res.json(out)
}

exports.remove = async (req, res) => {
  const { id } = req.params
  const prod = await Product.findById(id)
  if (!prod) return res.status(404).json({ msg: 'Not found' })
  await Order.deleteMany({ 'products.productId': id })
  await Product.findByIdAndDelete(id)
  res.json({ msg: 'Deleted' })
}
