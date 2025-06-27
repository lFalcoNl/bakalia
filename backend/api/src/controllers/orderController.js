// backend/api/src/controllers/orderController.js
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')

// helper: fresh product snapshot
async function snapshotProducts(items) {
  return Promise.all(
    items.map(async item => {
      const prod = await Product.findById(item.productId)
      return {
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity
      }
    })
  )
}

// helper: fresh user snapshot
async function snapshotUser(userId) {
  const u = await User.findById(userId, 'surname phone street')
  return {
    userName: u.surname,
    userPhone: u.phone,
    userStreet: u.street
  }
}

// GET /orders — всі (адмін)
exports.getAll = async (req, res) => {
  try {
    // fetch plain JS objects
    const raws = await Order.find().sort({ createdAt: -1 }).lean()

    // for each, if still 'new', inject fresh prices & user info (no save)
    const orders = await Promise.all(
      raws.map(async o => {
        if (o.status === 'new') {
          const prods = await snapshotProducts(o.products)
          const userSnap = await snapshotUser(o.userId)
          return { ...o, products: prods, ...userSnap }
        }
        return o
      })
    )

    res.json(orders)
  } catch (err) {
    console.error('orderController.getAll error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

// GET /orders/my — свої (юзер)
exports.getMyOrder = async (req, res) => {
  try {
    const raws = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()

    const orders = await Promise.all(
      raws.map(async o => {
        if (o.status === 'new') {
          const prods = await snapshotProducts(o.products)
          const userSnap = await snapshotUser(o.userId)
          return { ...o, products: prods, ...userSnap }
        }
        return o
      })
    )

    res.json(orders)
  } catch (err) {
    console.error('orderController.getMyOrder error:', err)
    res.status(500).json({ msg: 'Помилка отримання ваших замовлень' })
  }
}

// POST /orders — створити або оновити чернетку (status: 'new')
exports.create = async (req, res) => {
  try {
    const newItems = req.body.products
    const frozenProducts = await snapshotProducts(newItems)
    const userSnap = await snapshotUser(req.user._id)

    let order = await Order.findOne({ userId: req.user._id, status: 'stack' })
    if (!order) {
      order = new Order({
        userId: req.user._id,
        ...userSnap,
        products: frozenProducts,
        contact: req.user.phone
      })
    } else {
      frozenProducts.forEach(item => {
        const ex = order.products.find(p =>
          p.productId.equals(item.productId)
        )
        if (ex) ex.quantity += item.quantity
        else order.products.push(item)
      })
      Object.assign(order, userSnap)
    }

    await order.save()
    res.json(order)
  } catch (err) {
    console.error('orderController.create error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

// PATCH /orders/:id — змінити статус
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ msg: 'Замовлення не знайдено' })

    // 1) Backfill user snapshot if missing (migrates old docs)
    if (!order.userName || !order.userPhone || !order.userStreet) {
      const userSnap = await snapshotUser(order.userId)
      order.userName = userSnap.userName
      order.userPhone = userSnap.userPhone
      order.userStreet = userSnap.userStreet
    }

    // 2) Freeze product snapshot only when entering 'processing'
    if (status === 'processing') {
      order.products = await snapshotProducts(order.products)
    }

    // 3) Update status & save
    order.status = status
    await order.save()

    res.json(order)
  } catch (err) {
    console.error('orderController.updateStatus error:', err)
    res.status(500).json({ msg: 'Помилка оновлення статусу' })
  }
}

// DELETE /orders/:id — видалити замовлення
exports.remove = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Замовлення видалено' })
  } catch (err) {
    console.error('orderController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення замовлення' })
  }
}

// DELETE /orders/:orderId/products/:productId — видалити товар з замовлення
exports.removeProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params
    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ msg: 'Замовлення не знайдено' })

    order.products = order.products.filter(
      p => !p.productId.equals(productId)
    )
    await order.save()
    res.json(order)
  } catch (err) {
    console.error('orderController.removeProduct error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару з замовлення' })
  }
}
