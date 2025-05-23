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
  const [showZoomOverlay, setShowZoomOverlay] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    setQuantity(existing ? existing.quantity : minOrder)
  }, [existing, minOrder])

  const changeQty = delta => {
    setQuantity(prev => Math.max(minOrder, prev + delta))
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
      <div className="relative bg-white border rounded-lg overflow-hidden flex flex-col h-[32rem] w-full sm:w-64 md:w-72 hover:shadow-lg transition-shadow duration-200">
        {/* 1. Зображення */}
        <div
          className="w-full aspect-square cursor-pointer overflow-hidden"
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

        {/* 2. Назва */}
        <div className="p-4 flex-shrink-0 min-h-[5rem]">
          <CollapsibleText
            text={product.name}
            maxChars={80}
            className="text-base sm:text-lg font-semibold text-gray-800"
            moreLabel="…докладніше"
            lessLabel="згорнути"
          />
        </div>

        {/* 3. Ціна + контролери в одному блоці, прокладається внизу */}
        <div className="mt-auto px-4 pb-4 flex flex-col space-y-2">
          {/* Ціна прямо над лічильником */}
          <p className="text-green-600 font-bold text-lg text-end">
            {product.price} ₴
          </p>

          {/* Лічильник + кнопка */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => changeQty(-1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
              >
                –
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value) && value >= 0) {
                    setQuantity(value)
                  }
                }}
                className="w-16 h-10 text-center border-x outline-none
             appearance-none
             [&::-webkit-inner-spin-button]:appearance-none
             [&::-webkit-outer-spin-button]:appearance-none
             [-moz-appearance:textfield]"
              />

              <button
                onClick={() => changeQty(1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="ml-4 w-28 h-10 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition"
            >
              {existing ? 'Оновити' : 'До кошика'}
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

      {/* Toast */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            {existing ? 'Кошик оновлено!' : 'Товар додано!'}
          </div>
        </div>
      )}
    </>
  )
}
