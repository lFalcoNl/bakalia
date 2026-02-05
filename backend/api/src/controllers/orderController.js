const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')

// Снапшот товарів
async function snapshotProducts(items) {
  return Promise.all(
    items.map(async item => {
      const prod = await Product.findById(item.productId)

      if (!prod) {
        return {
          productId: item.productId,
          name: '[товар видалено]',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity)
        }
      }

      return {
        productId: prod._id,
        name: prod.name,
        price: Number(item.price ?? prod.price), // ✅ IMPORTANT
        quantity: Number(item.quantity)
      }
    })
  )
}


// Снапшот юзера
async function snapshotUser(userId) {
  const u = await User.findById(userId, 'surname phone street')
  if (!u) {
    console.warn('⚠️ User not found:', userId)
    return {
      userName: '[користувача видалено]',
      userPhone: '',
      userStreet: ''
    }
  }
  return {
    userName: u.surname,
    userPhone: u.phone,
    userStreet: u.street
  }
}

// GET /orders — всі замовлення
exports.getAll = async (_req, res) => {
  try {
    const raws = await Order.find().sort({ createdAt: -1 }).lean()

    const orders = await Promise.all(
      raws.map(async o => {
        if (o.status === 'new') {
          const prods = await snapshotProducts(o.products)
          return { ...o, products: prods }
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

// GET /orders/my — замовлення користувача
exports.getMyOrder = async (req, res) => {
  try {
    const raws = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()

    const orders = await Promise.all(
      raws.map(async o => {
        if (o.status === 'new') {
          const prods = await snapshotProducts(o.products)
          return { ...o, products: prods }
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

// POST /orders — створити або оновити активне замовлення
exports.create = async (req, res) => {
  try {
    const frozenProducts = await snapshotProducts(req.body.products)

    const user = await User.findById(req.user._id, 'surname phone street')
    if (!user) return res.status(404).json({ msg: 'Користувача не знайдено' })

    const userSnap = {
      userId: user._id,
      userName: user.surname,
      userPhone: user.phone,
      userStreet: user.street
    }

    let order = await Order.findOne({ userId: user._id, status: '___' })

    if (!order) {
      order = new Order({
        ...userSnap,
        products: frozenProducts,
        contact: user.phone,
        status: 'new'
      })
    } else {
      frozenProducts.forEach(item => {
        const existing = order.products.find(p =>
          p.productId.equals(item.productId)
        )
        if (existing) existing.quantity += item.quantity
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

    // Дозаповнення інформації
    if (!order.userName || !order.userPhone || !order.userStreet) {
      const userSnap = await snapshotUser(order.userId)
      Object.assign(order, userSnap)
    }

    // Заморожуємо товари при переході в "processing"
    if (status === 'processing') {
      order.products = await snapshotProducts(order.products)
    }

    order.status = status
    await order.save()

    res.json(order)
  } catch (err) {
    console.error('orderController.updateStatus error:', err)
    res.status(500).json({ msg: 'Помилка оновлення статусу' })
  }
}

// DELETE /orders/:id
exports.remove = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Замовлення видалено' })
  } catch (err) {
    console.error('orderController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення замовлення' })
  }
}

// DELETE /orders/:orderId/products/:productId
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
