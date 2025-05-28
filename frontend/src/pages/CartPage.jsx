// frontend/src/pages/CartPage.jsx
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

export default function CartPage() {
  const { cart, updateItem, removeItem: removeCartItem, clearCart, totalPrice } = useCart()
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [cartLoading, setCartLoading] = useState(true)

  // округлення до одного знаку
  const round1 = n => Math.round(n * 10) / 10

  const statusLabels = {
    new: 'Нове',
    processing: 'В обробці',
    done: 'Виконано'
  }

  const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  // Завантажуємо історію замовлень
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const resp = await api.get('/orders/my')
      const data = resp.data
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : []
      setOrders(sorted)
    } catch (err) {
      addNotification('Не вдалося завантажити історію замовлень')
    } finally {
      setOrdersLoading(false)
    }
  }, [addNotification])

  // Завантаження замовлень
  useEffect(() => {
    fetchOrders?.()
  }, [fetchOrders])

  // Імітуємо завантаження кошика
  useEffect(() => {
    const timer = setTimeout(() => setCartLoading(false), 0) // optional delay to mimic async
    return () => clearTimeout(timer)
  }, [])


  // Підтвердження замовлення
  const handleConfirm = async () => {
    if (!user) {
      addNotification('Будь ласка, зареєструйтесь для оформлення')
      navigate('/register', { replace: true })
      return
    }
    if (!cart.length) {
      addNotification('Ваш кошик порожній')
      return
    }
    if (round1(totalPrice) < 2000) {
      addNotification('Мінімальна сума замовлення — 2000 ₴')
      return
    }
    for (const { product, quantity } of cart) {
      const min = product.minOrder || 1
      if (quantity < min) {
        addNotification(`Мінімальна кількість для "${product.name}" — ${min}`)
        return
      }
    }

    setLoading(true)
    try {
      await api.post('/orders', {
        products: cart.map(({ product, quantity }) => ({
          productId: product._id,
          quantity,
          price: round1(product.price)
        }))
      })
      addNotification('Замовлення успішно створено')
      clearCart()
      await fetchOrders()
    } catch {
      addNotification('Не вдалося оформити замовлення')
    } finally {
      setLoading(false)
    }
  }

  // Зміна кількості в кошику
  const changeQty = (product, delta) => {
    const current = cart.find(i => i.product._id === product._id).quantity
    const next = current + delta
    if (next < (product.minOrder || 1)) {
      addNotification(`Мінімальна кількість — ${product.minOrder || 1}`)
      return
    }
    updateItem(product._id, next)
  }

  const clearAll = () => {
    if (window.confirm('Очистити кошик?')) clearCart()
  }

  // Підрахунок підсумку замовлення
  const computeOrderTotal = order =>
    round1(
      order.products.reduce((sum, p) => {
        const unit = p.price ?? p.productId?.price ?? 0
        return sum + unit * p.quantity
      }, 0)
    )

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Ваш кошик</h1>

      {cartLoading ? (
        <div className="text-center py-20 text-gray-500">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4">Завантаження товарів…</p>
        </div>
      ) : !cart.length ? (
        <div className="flex flex-col items-center py-20 text-gray-500">
          <span className="text-6xl mb-4">🛒</span>
          <p className="text-lg">Кошик порожній</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.table
            className="hidden md:table w-full table-auto bg-white shadow-sm rounded overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3 text-left">Товар</th>
                <th className="p-3 text-left">Ціна</th>
                <th className="p-3 text-left">К-ть</th>
                <th className="p-3 text-left">Сума</th>
                <th className="p-3 text-left">Дія</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(({ product, quantity }) => {
                const unitPrice = round1(product.price)
                const lineTotal = round1(unitPrice * quantity)
                return (
                  <motion.tr
                    key={product._id}
                    className="border-t hover:bg-gray-50"
                    variants={itemVariants}
                  >
                    <td className="p-3 flex items-start space-x-4">
                      <img
                        src={product.image || '/images/categories/nophoto.png'}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block w-full break-words">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{unitPrice} ₴</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => changeQty(product, -1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => changeQty(product, 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3">{lineTotal} ₴</td>
                    <td className="p-3">
                      <button
                        onClick={() => removeCartItem(product._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Видалити
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </motion.table>

          {/* Mobile cards */}
          <motion.div
            className="md:hidden space-y-4"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {cart.map(({ product, quantity }) => {
              const unitPrice = round1(product.price)
              const lineTotal = round1(unitPrice * quantity)
              return (
                <motion.div
                  key={product._id}
                  className="bg-white shadow-sm rounded p-4"
                  variants={itemVariants}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold break-words">{product.name}</h2>
                    <button
                      onClick={() => removeCartItem(product._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Видалити
                    </button>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Ціна за од.: {unitPrice} ₴</span>
                    <span>К-ть: {quantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Сума:</span>
                    <span>{lineTotal} ₴</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Summary & confirm */}
          <motion.div
            className="mt-6 bg-white shadow-sm rounded p-4 flex flex-col md:flex-row md:items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-lg font-semibold mb-4 md:mb-0">
              Всього: <span className="text-green-600">{round1(totalPrice)} ₴</span>
            </div>
            {round1(totalPrice) < 2000 && (
              <p className="text-red-500 text-sm mb-4 md:mb-0">
                Мінімальне замовлення — 2000 ₴. Додайте ще {round1(2000 - round1(totalPrice))} ₴.
              </p>
            )}
            <div className="flex space-x-2">
              <motion.button
                onClick={handleConfirm}
                disabled={loading || round1(totalPrice) < 2000}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Оформляємо…' : 'Підтвердити'}
              </motion.button>
              <button
                onClick={clearAll}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Очистити кошик
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Історія замовлень */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Історія замовлень</h2>
        {ordersLoading ? (
          <div className="text-center py-10">
            <motion.div
              className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <p className="mt-4 text-gray-500">Завантаження історії…</p>
          </div>
        ) : !orders.length ? (
          <p className="text-gray-500">Ви ще не робили замовлень</p>
        ) : (
          <motion.ul className="space-y-6" initial="hidden" animate="visible" variants={listVariants}>
            {orders.map(order => {
              const total = computeOrderTotal(order)
              const statusBorder =
                order.status === 'new' ? 'border-yellow-500' :
                  order.status === 'processing' ? 'border-blue-500' :
                    'border-green-500'
              return (
                <motion.li
                  key={order._id}
                  className={`bg-white rounded shadow-sm p-4 border-l-4 ${statusBorder}`}
                  variants={itemVariants}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">ID: {order._id}</span>
                    <span className="text-sm text-gray-500">
                      {dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}
                    </span>
                  </div>
                  <div className="mb-2"><strong>Статус:</strong> {statusLabels[order.status]}</div>
                  <div className="mb-2">
                    <strong>Сума замовлення:</strong> <span className="text-green-600">{total} ₴</span>
                  </div>
                  <div className="font-medium mb-1">Товари:</div>
                  <ul className="pl-4 list-disc text-sm text-gray-700 space-y-1">
                    {order.products.map((p, i) => {
                      const name = p.productId?.name || '—'
                      const unit = p.price ?? p.productId?.price ?? 0
                      const line = round1(unit * p.quantity)
                      return (
                        <li key={i} className="flex justify-between">
                          <span className="break-words">{name} × {p.quantity}</span>
                          <span>{line} ₴</span>
                        </li>
                      )
                    })}
                  </ul>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </div>
    </div>
  )
}
