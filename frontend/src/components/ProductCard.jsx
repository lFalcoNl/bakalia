import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'

export default function ProductCard({ product }) {
  const minOrder = product.minOrder || 1
  const [quantity, setQuantity] = useState(minOrder)
  const [showModal, setShowModal] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showZoomOverlay, setShowZoomOverlay] = useState(false)
  const { user } = useContext(AuthContext)
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const imgSrc = product.image || '/images/categories/nophoto.png'

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

  const openZoom = () => {
    setShowZoomOverlay(true)
    setTimeout(() => setIsZoomed(true), 20)
  }

  const closeZoom = () => {
    setIsZoomed(false)
    setTimeout(() => setShowZoomOverlay(false), 300)
  }

  return (
    <>
      <div className="bg-white border rounded-lg overflow-hidden flex flex-col">
        {/* Зображення */}
        <div
          className="relative w-full aspect-square cursor-pointer overflow-hidden"
          onClick={openZoom}
        >
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </div>

        {/* Інформація */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-green-600 font-bold mb-3">{product.price} ₴</p>

          {/* Кількість + кнопка */}
          <div className="mt-auto flex items-center space-x-2">
            <input
              type="number"
              min={minOrder}
              value={quantity}
              onChange={e => {
                const val = Math.max(minOrder, Number(e.target.value) || minOrder)
                setQuantity(val)
              }}
              className="w-16 border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
            />
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
            >
              Додати до кошика
            </button>
          </div>
        </div>
      </div>
      {/* Зум */}
      {showZoomOverlay && (
        <div
          className={`
            fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4
            transition-opacity duration-300
            ${isZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={closeZoom}
        >
          <div
            className={`
              w-full max-w-md md:max-w-3xl max-h-[80vh]
              transform transition-transform duration-300
              ${isZoomed ? 'scale-100' : 'scale-75'}
            `}
          >
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain rounded shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Повідомлення */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            Товар додано до корзини!
          </div>
        </div>
      )}
    </>
  )
}
