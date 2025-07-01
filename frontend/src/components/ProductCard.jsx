import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import CollapsibleText from './CollapsibleText'
// Імпортуємо іконки з react-icons/fi
import { FiShoppingCart, FiRotateCw } from 'react-icons/fi'

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
    const initialQuantity = existing?.quantity ?? minOrder
    setQuantity(initialQuantity)
  }, [existing?.quantity, minOrder])

  const changeQty = delta =>
    setQuantity(prev => Math.max(minOrder, prev + delta))

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
      <div className="relative bg-white border rounded-lg overflow-hidden flex flex-col h-full w-full hover:shadow-lg transition-shadow duration-200">
        {/* Зображення */}
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

        {/* Назва */}
        <div className="p-4 flex-shrink-0">
          <CollapsibleText
            text={product.name}
            maxChars={80}
            className="text-base sm:text-lg font-semibold text-gray-800"
            moreLabel="…докладніше"
            lessLabel="згорнути"
          />
        </div>

        {/* Ціна + контролери */}
        <div className="mt-auto px-4 pb-4 flex flex-col space-y-2">
          <p className="text-green-600 font-bold text-lg text-right">
            {product.price} ₴
          </p>

          <div className="flex items-center justify-between">
            {/* Лічильник */}
            <div className="flex-shrink-0 flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => changeQty(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
              >
                –
              </button>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                step="1"
                value={quantity}
                onChange={e => {
                  const v = e.target.value
                  if (v === '') setQuantity('')
                  else if (/^\d+$/.test(v)) setQuantity(+v)
                }}
                onBlur={() => {
                  if (quantity === '') setQuantity(minOrder)
                }}
                className="w-12 h-8 text-center border-x outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <button
                onClick={() => changeQty(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>

            {/* Іконка корзини з накладеним маленьким оновленням */}
            <button
              onClick={handleAddToCart}
              aria-label={existing ? 'Оновити кошик' : 'Додати до кошика'}
              className="ml-4 relative flex-shrink-0 w-10 h-10 bg-green-600 hover:bg-green-700 transition flex items-center justify-center text-white rounded-full"
            >
              <FiShoppingCart className="w-6 h-6" />
              {existing && (
                <FiRotateCw className="absolute -top-1 -right-1 w-4 h-4 p-0.5 bg-green-800 rounded-full text-white" />
              )}
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
    </>
  )
}
