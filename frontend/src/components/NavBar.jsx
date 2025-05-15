// frontend/src/components/NavBar.jsx
import React, { useContext, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const { cart } = useCart()
  const [open, setOpen] = useState(false)
  const [prevCount, setPrevCount] = useState(cart.length)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (cart.length > prevCount) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    setPrevCount(cart.length)
  }, [cart.length, prevCount])

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-secondary/20 transition ${isActive ? 'bg-secondary/30' : ''
    }`

  return (
    <header className="sticky top-0 z-50 bg-primary text-secondary shadow-md">
      <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between py-3">
        <NavLink to="/" className="flex items-center space-x-2">
          <img
            src="/images/logo/noSignLogo.png"
            alt="Logo"
            className="h-10 rounded-md"
          />
          <span className="text-2xl md:text-lg font-bold">Бакалійний Двір</span>
        </NavLink>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>

        <nav
          className={`
            ${open ? 'block' : 'hidden'}
            absolute top-full left-0 w-full bg-primary shadow-lg
            md:static md:block md:w-auto md:bg-transparent md:shadow-none
            overflow-x-hidden
          `}
        >
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 px-4 py-4 md:p-0">
            <NavLink to="/" className={linkClass}>
              Головна
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `${linkClass({ isActive })} flex items-center space-x-1 ${shake ? 'animate-bounce' : ''
                }`
              }
            >
              <span>Корзина</span>
              <span>🛒</span>
              {cart.length > 0 && (
                <span className="bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </NavLink>

            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin/products" className={linkClass}>
                  Товари
                </NavLink>
                <NavLink to="/admin/orders" className={linkClass}>
                  Замовлення
                </NavLink>
                <NavLink to="/admin/users" className={linkClass}>
                  Користувачі
                </NavLink>
              </>
            )}

            {user ? (
              <button
                onClick={logout}
                className="px-3 py-2 rounded hover:bg-secondary/20 transition text-left"
              >
                Вийти
              </button>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Вхід
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Реєстрація
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
