import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import CollapsibleText from './CollapsibleText'
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
  const [showZoomOverlay, setShowZoomOverlay] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // ---------- BULK LOGIC (UNCHANGED) ----------
  const hasBulkPrice =
    typeof product.wholesalePrice === 'number' &&
    typeof product.wholesaleMinQty === 'number'

  const safeQty = quantity === '' ? 0 : quantity

  const isBulkActive =
    hasBulkPrice && safeQty >= product.wholesaleMinQty

  const remainingToBulk = hasBulkPrice
    ? Math.max(product.wholesaleMinQty - safeQty, 0)
    : 0

  const displayPrice = isBulkActive
    ? product.wholesalePrice
    : product.price

  // ---------- SYNC ----------
  useEffect(() => {
    setQuantity(existing?.quantity ?? minOrder)
  }, [existing?.quantity, minOrder])

  const changeQty = delta =>
    setQuantity(prev => Math.max(minOrder, (prev || 0) + delta))

  const handleAddToCart = () => {
    if (!user) {
      addNotification('Будь ласка, увійдіть для оформлення замовлення')
      return
    }
    if (safeQty < minOrder) {
      addNotification(`Мінімальна кількість — ${minOrder}`)
      return
    }

    if (existing) {
      updateItem(product._id, safeQty)
      addNotification('Кількість оновлено')
    } else {
      addItem(product, safeQty)
      addNotification('Товар додано до кошика')
    }
  }

  // ---------- ZOOM ----------
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
      <div
        className={`
          relative bg-white rounded-xl overflow-hidden flex flex-col h-full
          border transition
          ${existing ? 'border-green-500 ring-1 ring-green-200' : 'border-gray-200'}
        `}
      >
        {/*  IN CART */}
        {existing && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
            В кошику
          </span>
        )}

        {/* IMAGE */}
        <div
          className="w-full aspect-square cursor-pointer overflow-hidden"
          onClick={openZoom}
        >
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
        </div>

        {/* TITLE */}
        <div className="p-4">
          <CollapsibleText
            text={product.name}
            maxChars={80}
            className="text-sm sm:text-base font-medium text-gray-800"
            moreLabel="…докладніше"
            lessLabel="згорнути"
          />
        </div>

        {/* PRICE BLOCK — FIXED HEIGHT */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">

            {/* LEFT: bulk info */}
            <div className="flex flex-col gap-1 min-h-[44px] justify-end">
              {hasBulkPrice ? (
                <span
                  className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${isBulkActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'}
          `}
                >
                  {isBulkActive
                    ? 'Оптова ціна'
                    : `Опт від ${product.wholesaleMinQty} шт`}
                </span>
              ) : (
                // reserve space so height never jumps
                <span className="invisible px-3 py-1 text-xs">placeholder</span>
              )}
            </div>

            {/* RIGHT: prices */}
            <div className="flex flex-col items-end text-right min-w-[72px]">
              <span
                className={`text-sm line-through ${isBulkActive ? 'text-gray-400' : 'invisible'
                  }`}
              >
                {product.price} ₴
              </span>

              <span className="text-xl font-semibold text-green-600 leading-tight">
                {displayPrice} ₴
              </span>
            </div>

          </div>
        </div>


        {/* CONTROLS — CLEAN */}
        <div className="p-4 pb-4 h-[56px] flex items-center justify-between gap-3">
          {/* Quantity */}
          <div className="flex items-center border rounded-md h-10 overflow-hidden">
            <button
              onClick={() => changeQty(-1)}
              className="w-8 h-full hover:bg-gray-100"
            >−</button>
            <input
              type="number"
              value={quantity}
              onChange={e => {
                const v = e.target.value
                if (v === '') setQuantity('')
                else if (/^\d+$/.test(v)) setQuantity(+v)
              }}
              onBlur={() => quantity === '' && setQuantity(minOrder)}
              className="w-12 h-8 text-center border-x outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <button
              onClick={() => changeQty(1)}
              className="w-8 h-full hover:bg-gray-100"
            >+</button>
          </div>

          {/* Button — WHITE, BORDER */}
          <button
            onClick={handleAddToCart}
            aria-label={existing ? 'Оновити кошик' : 'Додати до кошика'}
            className={`
    relative
    flex-1 h-10 min-w-[44px]
    rounded-md
    flex items-center justify-center gap-2
    font-medium
    transition
    ${existing
                ? `
          bg-white
          border border-green-600
          text-green-600
          hover:bg-green-50
        `
                : `
          bg-green-600
          border border-green-600
          text-white
          hover:bg-green-700
        `
              }
  `}
          >
            {/* Cart icon — always visible */}
            <FiShoppingCart className="w-5 h-5" />

            {/* Text — desktop only */}
            <span className="hidden sm:inline">
              {/* {existing ? 'Оновити' : 'До кошика'} */}
            </span>

            {/* Refresh badge — top right, only if in cart */}
            {existing && (
              <span
                className="
        absolute -top-1 -right-1
        w-5 h-5
        rounded-full
        bg-green-600
        text-white
        flex items-center justify-center
        shadow
      "
              >
                <FiRotateCw className="w-3 h-3" />
              </span>
            )}
          </button>



        </div>
      </div>

      {/* ZOOM OVERLAY */}
      {showZoomOverlay && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition
            ${isZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={closeZoom}
        >
          <img
            src={imgSrc}
            alt={product.name}
            className="max-h-[80vh] object-contain rounded"
          />
        </div>
      )}
    </>
  )
}
