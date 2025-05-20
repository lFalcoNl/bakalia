import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import CollapsibleText from './CollapsibleText'

export default function ProductCard({ product }) {
  const minOrder = product.minOrder || 1
  const { user } = useContext(AuthContext)
  const { cart, addItem, updateItem } = useCart()
  const { addNotification } = useNotification()
  const imgSrc = product.image || '/images/categories/nophoto.png'

  const existing = cart.find(item => item.product._id === product._id)
  const initialQty = existing ? existing.quantity : minOrder

  const [quantity, setQuantity] = useState(initialQty)
  const [showModal, setShowModal] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showZoomOverlay, setShowZoomOverlay] = useState(false)

  useEffect(() => {
    setQuantity(existing ? existing.quantity : minOrder)
  }, [existing, minOrder])

  const changeQty = delta => {
    setQuantity(prev => {
      const next = prev + delta
      return next < minOrder ? minOrder : next
    })
  }

  const handleAddToCart = () => {
    if (!user) {
      addNotification('Будь ласка, увійдіть для оформлення замовлення')
      return
    }
    if (quantity < minOrder) {
      addNotification(`Мінімальна кількість — ${minOrder}`)
      return
    }
    if (existing) {
      updateItem(product._id, quantity)
      addNotification('Кількість оновлено в кошику')
    } else {
      addItem(product, quantity)
      addNotification('Товар додано до кошика')
    }
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
      <div className="relative bg-white border rounded-lg overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
        {/* Image & "In Cart" badge */}
        <div
          className="relative w-full aspect-square cursor-pointer overflow-hidden"
          onClick={openZoom}
        >
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
          {existing && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
              В кошику
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title with fixed min-height */}
          <CollapsibleText
            text={product.name}
            maxChars={80}
            className="
              text-base sm:text-lg font-semibold mb-2 text-gray-800
              min-h-[3rem] sm:min-h-[3.5rem] md:min-h-[4rem]
            "
            moreLabel="…докладніше"
            lessLabel="згорнути"
          />

          {/* Price always in same spot */}
          <p className="text-green-600 font-bold mb-4">{product.price} ₴</p>

          {/* Quantity stepper & Add button */}
          <div className="mt-auto flex items-center space-x-2">
            <button
              onClick={() => changeQty(-1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition"
            >–</button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              onClick={() => changeQty(1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition"
            >+</button>

            <button
              onClick={handleAddToCart}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
            >
              {existing ? 'Оновити кошик' : 'Додати до кошика'}
            </button>
          </div>
        </div>
      </div>

      {/* Zoom overlay */}
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

      {/* Added-to-cart toast */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            {existing ? 'Кошик оновлено!' : 'Товар додано до кошика!'}
          </div>
        </div>
      )}
    </>
  )
}
