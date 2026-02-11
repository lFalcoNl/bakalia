const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')

/* ===================== PRICING (BACKEND AUTHORITATIVE) ===================== */
function getUnitPrice(product, quantity) {
  const qty = Number(quantity) || 0

  const price = Number(product.price) || 0
  const wholesalePrice = Number(product.wholesalePrice) || 0
  const minQty = Number(product.wholesaleMinQty) || 0

  if (wholesalePrice > 0 && minQty > 0 && qty >= minQty) {
    return wholesalePrice
  }

  return price
}

function calcOrderTotal(products) {
  return products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  )
}

/* ===================== SNAPSHOT PRODUCTS ===================== */
async function snapshotProducts(items) {
  return Promise.all(
    items.map(async item => {
      const qty = Number(item.quantity) || 0
      const prod = await Product.findById(item.productId)

      if (!prod) {
        return {
          productId: item.productId,
          name: '[товар видалено]',
          price: 0,
          quantity: qty
        }
      }

      const unitPrice = getUnitPrice(prod, qty)

      return {
        productId: prod._id,
        name: prod.name,
        price: unitPrice, // 🔐 calculated on backend
        quantity: qty
      }
    })
  )
}

/* ===================== SNAPSHOT USER ===================== */
async function snapshotUser(userId) {
  const u = await User.findById(userId, 'surname phone street')
  if (!u) {
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

/* ===================== GET ALL ORDERS ===================== */
exports.getAll = async (_req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean()

    // ❌ NO RECALCULATION — return snapshots only
    res.json(orders)
  } catch (err) {
    console.error('orderController.getAll error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

/* ===================== GET MY ORDERS ===================== */
exports.getMyOrder = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()

    // ❌ NO RECALCULATION
    res.json(orders)
  } catch (err) {
    console.error('orderController.getMyOrder error:', err)
    res.status(500).json({ msg: 'Помилка отримання ваших замовлень' })
  }
}

/* ===================== CREATE ORDER ===================== */
exports.create = async (req, res) => {
  try {
    const frozenProducts = await snapshotProducts(req.body.products)

    if (!frozenProducts.length) {
      return res.status(400).json({ msg: 'Порожнє замовлення' })
    }

    const total = calcOrderTotal(frozenProducts)

    if (total < 2000) {
      return res.status(400).json({ msg: 'Мінімальна сума замовлення — 2000 ₴' })
    }

    const user = await User.findById(req.user._id, 'surname phone street')
    if (!user) {
      return res.status(404).json({ msg: 'Користувача не знайдено' })
    }

    const userSnap = {
      userId: user._id,
      userName: user.surname,
      userPhone: user.phone,
      userStreet: user.street
    }

    let order = await Order.findOne({
      userId: user._id,
      status: '___'
    })

    if (!order) {
      order = new Order({
        ...userSnap,
        products: frozenProducts,
        total,
        contact: user.phone,
        status: 'new'
      })
    } else {
      frozenProducts.forEach(item => {
        const existing = order.products.find(p =>
          p.productId.equals(item.productId)
        )

        if (existing) {
          existing.quantity += item.quantity
        } else {
          order.products.push(item)
        }
      })

      order.total = calcOrderTotal(order.products)
      Object.assign(order, userSnap)
    }

    await order.save()
    res.json(order)
  } catch (err) {
    console.error('orderController.create error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

/* ===================== UPDATE STATUS ===================== */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ msg: 'Замовлення не знайдено' })
    }

    if (!order.userName || !order.userPhone || !order.userStreet) {
      const userSnap = await snapshotUser(order.userId)
      Object.assign(order, userSnap)
    }

    order.status = status
    await order.save()

    res.json(order)
  } catch (err) {
    console.error('orderController.updateStatus error:', err)
    res.status(500).json({ msg: 'Помилка оновлення статусу' })
  }
}

/* ===================== DELETE ORDER ===================== */
exports.remove = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Замовлення видалено' })
  } catch (err) {
    console.error('orderController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення замовлення' })
  }
}

/* ===================== DELETE PRODUCT FROM ORDER ===================== */
exports.removeProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ msg: 'Замовлення не знайдено' })
    }

    order.products = order.products.filter(
      p => !p.productId.equals(productId)
    )

    order.total = calcOrderTotal(order.products)
    await order.save()

    res.json(order)
  } catch (err) {
    console.error('orderController.removeProduct error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару з замовлення' })
  }
}
