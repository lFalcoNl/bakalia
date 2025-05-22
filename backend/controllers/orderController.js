// backend/controllers/orderController.js
const Order = require('../models/Order')

exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'surname phone street')
      .populate('products.productId', 'name price')
    res.json(orders)
  } catch (err) {
    console.error('orderController.getAll error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

// GET /orders/my — всі замовлення поточного користувача
exports.getMyOrder = async (req, res) => {
  try {
    const userId = req.user._id

    // Знаходимо всі замовлення користувача, сортуємо за датою
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'surname phone street')
      .populate('products.productId', 'name price')

    // Повертаємо масив (може бути порожнім)
    res.json(orders)
  } catch (err) {
    console.error('orderController.getMyOrder error:', err)
    res.status(500).json({ msg: 'Помилка отримання ваших замовлень' })
  }
}

exports.create = async (req, res) => {
  try {
    const { products: newItems } = req.body
    let order = await Order.findOne({ userId: req.user._id, status: 'new' })
    if (!order) {
      order = new Order({
        userId: req.user._id,
        products: newItems,
        contact: req.user.phone
      })
    } else {
      newItems.forEach(newItem => {
        const exist = order.products.find(
          p => p.productId.toString() === newItem.productId
        )
        if (exist) {
          exist.quantity += newItem.quantity
        } else {
          order.products.push(newItem)
        }
      })
    }
    await order.save()

    const populated = await Order.findById(order._id)
      .populate('userId', 'surname phone street')
      .populate('products.productId', 'name price')

    res.json(populated)
  } catch (err) {
    console.error('orderController.create error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate('userId', 'surname phone street')
      .populate('products.productId', 'name price')
    res.json(updated)
  } catch (err) {
    console.error('orderController.updateStatus error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

exports.remove = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Замовлення видалено' })
  } catch (err) {
    console.error('orderController.remove error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

exports.removeProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ msg: 'Замовлення не знайдено' })
    }
    order.products = order.products.filter(
      p => p.productId.toString() !== productId
    )
    await order.save()

    const updated = await Order.findById(orderId)
      .populate('userId', 'surname phone street')
      .populate('products.productId', 'name price')
    res.json(updated)
  } catch (err) {
    console.error('orderController.removeProduct error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару з замовлення' })
  }
}
