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
    if (!product) return 0

    const qty = Number(quantity) || 0

    const basePrice =
      typeof product.price === 'number'
        ? product.price
        : Number(product.price) || 0

    const wholesalePrice =
      typeof product.wholesalePrice === 'number'
        ? product.wholesalePrice
        : Number(product.wholesalePrice) || 0

    const wholesaleMinQty =
      typeof product.wholesaleMinQty === 'number'
        ? product.wholesaleMinQty
        : Number(product.wholesaleMinQty) || 0

    if (wholesalePrice > 0 && wholesaleMinQty > 0 && qty >= wholesaleMinQty) {
      return wholesalePrice
    }

    return basePrice
  }

  /* -------------------- actions -------------------- */
  const addItem = (product, quantity = 1) => {
    setCart(prev => {
      const qty = Math.max(Number(quantity) || 0, product.minOrder || 1)
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
      prev.map(item =>
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
