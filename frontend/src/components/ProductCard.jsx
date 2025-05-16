import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'

export default function ProductCard({ product }) {
  const minOrder = product.minOrder || 1
  const [quantity, setQuantity] = useState(minOrder)
  const [showModal, setShowModal] = useState(false)
  const { user } = useContext(AuthContext)
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const imgSrc = product.image || '/images/placeholder.png'

  useEffect(() => {
    setQuantity(minOrder)
  }, [minOrder])

  const handleAddToCart = () => {
    if (!user) {
      addNotification('Будь ласка, увійдіть для оформлення замовлення')
      return
    }
    if (quantity < minOrder) {
      addNotification(`Мінімальна кількість — ${minOrder}`)
      return
    }
    addItem(product, quantity)
    setShowModal(true)
    setTimeout(() => setShowModal(false), 2000)
  }

  return (
    <>
      <div className="border rounded-lg p-4 flex flex-col">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-48 object-cover mb-4"
        />
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="mt-2 text-green-600 font-bold">
          {product.price} ₴
        </p>
        <div className="mt-auto flex items-center space-x-2">
          <input
            type="number"
            min={minOrder}
            value={quantity}
            onChange={e => {
              const val = Math.max(minOrder, Number(e.target.value) || minOrder)
              setQuantity(val)
            }}
            className="w-16 border p-1 rounded text-sm"
          />
          <button
            onClick={handleAddToCart}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
          >
            Додати до кошика
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            Товар додано до корзини!
          </div>
        </div>
      )}
    </>
  )
}