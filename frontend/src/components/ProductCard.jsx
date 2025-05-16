// frontend/src/components/ProductCard.jsx
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

  // Open zoom: mount overlay then trigger zoom
  const openZoom = () => {
    setShowZoomOverlay(true)
    // slight delay to allow mount before transition
    setTimeout(() => setIsZoomed(true), 20)
  }

  // Close zoom: reverse transition then unmount overlay
  const closeZoom = () => {
    setIsZoomed(false)
    // wait for transition to finish before unmount
    setTimeout(() => setShowZoomOverlay(false), 300)
  }

  return (
    <>
      <div className="border rounded-lg p-4 flex flex-col bg-white">
        {/* Thumbnail */}
        <img
          src={imgSrc}
          alt={product.name}
          className="h-48 w-full object-cover rounded cursor-pointer mb-4"
          onClick={openZoom}
        />

        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-green-600 font-bold mb-4">{product.price} ₴</p>

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
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
          >
            Додати до кошика
          </button>
        </div>
      </div>

      {/* Zoom overlay with entry/exit animations */}
      {showZoomOverlay && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4
            transition-opacity duration-300
            ${isZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeZoom}
        >
          <div
            className={`w-full max-w-3xl max-h-[80vh]
              transform transition-transform duration-300
              ${isZoomed ? 'scale-100' : 'scale-75'}`}
          >
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain rounded shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Added-to-cart confirmation */}
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
