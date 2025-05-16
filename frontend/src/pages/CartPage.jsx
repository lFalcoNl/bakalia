// frontend/src/pages/CartPage.jsx
import React, { useContext, useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, totalPrice } = useCart()
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [myOrder, setMyOrder] = useState(null)
  const [orderLoading, setOrderLoading] = useState(true)

  // Маппінг статусів на українські лейбли
  const statusLabels = {
    new: 'Новe',
    processing: 'В обробці',
    done: 'Виконано'
  }

  // Завантажуємо попереднє замовлення
  useEffect(() => {
    if (!user) {
      setOrderLoading(false)
      return
    }
    api.get('/orders/my')
      .then(({ data }) => setMyOrder(data))
      .catch(() => addNotification('Не вдалося завантажити ваше замовлення'))
      .finally(() => setOrderLoading(false))
  }, [user])

  const handleConfirm = async () => {
    if (!user) {
      addNotification('Будь ласка, увійдіть для оформлення')
      navigate('/login')
      return
    }
    if (cart.length === 0) {
      addNotification('Ваш кошик порожній')
      return
    }
    for (let { product, quantity } of cart) {
      const min = product.minOrder || 1
      if (quantity < min) {
        addNotification(`Мінімальна кількість для "${product.name}" — ${min}`)
        return
      }
    }
    setLoading(true)
    try {
      const { data: newOrder } = await api.post('/orders', {
        products: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        }))
      })
      addNotification('Замовлення успішно створено')
      setMyOrder(newOrder)
      clearCart()
    } catch {
      addNotification('Не вдалося оформити замовлення')
    } finally {
      setLoading(false)
    }
  }

  const changeQty = (product, delta) => {
    const min = product.minOrder || 1
    const current = cart.find(i => i.product._id === product._id).quantity
    const next = current + delta
    if (next < min) {
      addNotification(`Мінімальна кількість — ${min}`)
      return
    }
    updateItem(product._id, next)
  }

  const clearAll = () => {
    if (window.confirm('Очистити кошик?')) clearCart()
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Ваш кошик</h1>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-500">
          <span className="text-6xl mb-4">🛒</span>
          <p className="text-lg">Кошик порожній</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full table-fixed bg-white shadow-sm rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-3 w-1/5">Товар</th>
                  <th className="p-3 w-1/6">Ціна</th>
                  <th className="p-3 w-1/6">К-ть</th>
                  <th className="p-3 w-1/6">Сума</th>
                  <th className="p-3 w-1/6">Дія</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(({ product, quantity }) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center space-x-3">
                      <img
                        src={product.image || '/images/placeholder.png'}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <span>{product.name}</span>
                    </td>
                    <td className="p-3">{product.price} ₴</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => changeQty(product, -1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >−</button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => changeQty(product, 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >+</button>
                      </div>
                    </td>
                    <td className="p-3">{product.price * quantity} ₴</td>
                    <td className="p-3">
                      <button
                        onClick={() => removeItem(product._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {cart.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="bg-white shadow-sm rounded flex flex-col space-y-3 p-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image || '/images/placeholder.png'}
                    alt={product.name}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="text-green-600">{product.price} ₴</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => changeQty(product, -1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >−</button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => changeQty(product, 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(product._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Видалити
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Сума:</span>
                  <span className="font-semibold">
                    {product.price * quantity} ₴
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary & confirm */}
          <div className="mt-6 bg-white shadow-sm rounded p-4 flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-lg font-semibold mb-4 md:mb-0">
              Всього: <span className="text-green-600">{totalPrice} ₴</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Оформляємо...' : 'Підтвердити'}
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Очистити кошик
              </button>
            </div>
          </div>
        </>
      )}

      {/* Нижче показуємо ваше попереднє замовлення */}
      {!orderLoading && myOrder && (
        <div className="mt-12 p-6 bg-blue-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ваше попереднє замовлення</h2>
          <p className="mb-2">📦 <strong>ID:</strong> {myOrder._id}</p>
          <p className="mb-2">⏳ <strong>Статус:</strong> {statusLabels[myOrder.status]}</p>
          <p className="mb-4">🗓 <strong>Дата:</strong> {dayjs(myOrder.createdAt).format('DD.MM.YYYY HH:mm')}</p>

          <h3 className="text-lg font-medium mb-2">Склад замовлення:</h3>
          <ul className="space-y-2">
            {myOrder.products.map((p, i) => {
              const name = p.product?.name || p.productId?.name
              const qty = p.quantity
              const price = (p.product?.price ?? p.productId?.price) * qty
              return (
                <li key={i} className="flex justify-between">
                  <span>{name} × {qty}</span>
                  <span>{price} ₴</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
