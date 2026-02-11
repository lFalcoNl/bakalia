import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { getUnitPrice } from '../utils/pricing'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart'))
      return Array.isArray(stored)
        ? stored.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0
        }))
        : []
    } catch {
      return []
    }
  })

  /* -------------------- persist cart -------------------- */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  /* -------------------- actions -------------------- */
  const addItem = (product, quantity = 1) => {
    setCart(prev => {
      const min = product.minOrder || 1
      const qty = Number(quantity) > 0 ? Number(quantity) : min

      const id = product._id

      const idx = prev.findIndex(
        i => (i.product?._id ?? i.productId?._id) === id
      )

      if (idx !== -1) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + qty
        }
        return updated
      }

      return [...prev, { product, quantity: qty }]
    })
  }

  const updateItem = (productId, quantity) => {
    const qty = Number(quantity) || 0

    setCart(prev =>
      qty <= 0
        ? prev.filter(
          item =>
            (item.product?._id ?? item.productId?._id) !== productId
        )
        : prev.map(item =>
          (item.product?._id ?? item.productId?._id) === productId
            ? { ...item, quantity: qty }
            : item
        )
    )

  }

  const removeItem = productId => {
    setCart(prev =>
      prev.filter(
        item => (item.product?._id ?? item.productId?._id) !== productId
      )
    )
  }

  const clearCart = () => setCart([])

  /* -------------------- total price -------------------- */
  const totalPrice = useMemo(() => {
    return (
      Math.round(
        cart.reduce((sum, item) => {
          const product = item.product ?? item.productId
          if (!product) return sum

          const qty = Number(item.quantity) || 0
          const unit = getUnitPrice(product, qty)
          return sum + unit * qty

        }, 0) * 10
      ) / 10
    )
  }, [cart])

  /* -------------------- provider -------------------- */
  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
