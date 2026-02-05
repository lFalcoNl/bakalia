import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const getUnitPrice = (product, quantity) => {
    const basePrice = Number(product.price)
    const wholesalePrice = Number(product.wholesalePrice)
    const wholesaleMinQty = Number(product.wholesaleMinQty)

    if (
      Number.isFinite(wholesalePrice) &&
      Number.isFinite(wholesaleMinQty) &&
      quantity >= wholesaleMinQty
    ) {
      return wholesalePrice
    }

    return Number.isFinite(basePrice) ? basePrice : 0
  }


  const addItem = (product, quantity = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product._id === product._id)

      if (idx > -1) {
        const updated = [...prev]
        const nextQty = updated[idx].quantity + quantity

        updated[idx] = {
          ...updated[idx],
          quantity: nextQty
        }

        return updated
      }

      return [
        ...prev,
        {
          product,
          quantity: Math.max(quantity, product.minOrder || 1)
        }
      ]
    })
  }



  const updateItem = (productId, quantity) =>
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );

  const removeItem = productId =>
    setCart(prev => prev.filter(item => item.product._id !== productId));

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => {
    const unit = getUnitPrice(item.product, item.quantity)
    const qty = Number(item.quantity) || 0
    return sum + unit * qty
  }, 0)



  return (
    <CartContext.Provider
      value={{ cart, addItem, updateItem, removeItem, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
