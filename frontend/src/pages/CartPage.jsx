import React, { useContext, useState } from 'react'
import { useCart } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, totalPrice } = useCart()
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!user) {
      addNotification('Будь ласка, увійдіть для оформлення')
      navigate('/login')
      return
    }
    if (cart.length === 0) {
      addNotification('Корзина порожня')
      return
    }
    setLoading(true)
    try {
      const payload = {
        products: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        contact: user.email,
      }
      await api.post('/orders', payload)
      addNotification('Замовлення успішно створено')
      clearCart()
      navigate('/')
    } catch (err) {
      console.error(err)
      addNotification('Не вдалося оформити замовлення')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Ваша корзина</h1>
      {cart.length === 0 ? (
        <p>Корзина порожня</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div
                key={item.product._id}
                className="flex items-center justify-between border p-4 rounded"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image || '/images/placeholder.png'}
                    alt={item.product.name}
                    className="h-16 w-16 object-cover"
                  />
                  <div>
                    <h2 className="font-semibold">{item.product.name}</h2>
                    <p>{item.product.price} ₴</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e =>
                      updateItem(item.product._id, Number(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-red-600 hover:underline"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Всього: {totalPrice} ₴</p>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Оформлення...' : 'Підтвердити замовлення'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
