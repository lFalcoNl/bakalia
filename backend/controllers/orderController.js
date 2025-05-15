const Order = require('../models/Order')

exports.getAll = async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'email')
    .populate('products.productId', 'name price')
  res.json(orders)
}

exports.create = async (req, res) => {
  const { products: newItems } = req.body
  let order = await Order.findOne({ userId: req.user.id, status: 'new' })
  if (!order) {
    order = new Order({ userId: req.user.id, products: newItems, contact: req.user.email })
  } else {
    newItems.forEach(newItem => {
      const exist = order.products.find(p => p.productId.toString() === newItem.productId)
      if (exist) {
        exist.quantity += newItem.quantity
      } else {
        order.products.push(newItem)
      }
    })
  }
  await order.save()
  const populated = await Order.findById(order._id)
    .populate('userId', 'email')
    .populate('products.productId', 'name price')
  res.json(populated)
}

exports.updateStatus = async (req, res) => {
  const updated = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  )
    .populate('userId', 'email')
    .populate('products.productId', 'name price')
  res.json(updated)
}

exports.remove = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id)
  res.json({ msg: 'Замовлення видалено' })
}
