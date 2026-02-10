import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

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
  /* -------------------- helpers -------------------- */
  const getUnitPrice = (product, quantity) => {
  const qty = Number(quantity) || 0

  const basePrice = Number(
    String(product?.price ?? '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
  )

  const wholesalePrice = Number(
    String(product?.wholesalePrice ?? '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
  )

  const wholesaleMinQty = Number(product?.wholesaleMinQty)

  if (
    Number.isFinite(wholesalePrice) &&
    Number.isFinite(wholesaleMinQty) &&
    qty >= wholesaleMinQty
  ) {
    return wholesalePrice
  }

  return Number.isFinite(basePrice) ? basePrice : 0
}
  /* -------------------- actions -------------------- */
  const addItem = (product, quantity = 1) => {
    setCart(prev => {
      const qty = Math.max(Number(quantity) || 0, product.minOrder || 1)
      const idx = prev.findIndex(i => i.product._id === product._id)

      if (idx !== -1) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + qty
        }
        return updated
      }

      return [
        ...prev,
        {
          product,
          quantity: qty
        }
      ]
    })
  }

  const updateItem = (productId, quantity) => {
    const qty = Number(quantity) || 0

    setCart(prev =>
      prev.map(item =>
        item.product._id === productId
          ? { ...item, quantity: qty }
          : item
      )
    )
  }

  const removeItem = productId => {
    setCart(prev => prev.filter(item => item.product._id !== productId))
  }

  const clearCart = () => setCart([])

  /* -------------------- total price -------------------- */
  const totalPrice = useMemo(() => {
    return Math.round(
      cart.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0
        const unit = getUnitPrice(item.product, qty)
        return sum + unit * qty
      }, 0) * 10
    ) / 10
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
