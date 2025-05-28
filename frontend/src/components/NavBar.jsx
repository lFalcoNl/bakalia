// frontend/src/components/NavBar.jsx
import React, { useContext, useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const { cart } = useCart()
  const [open, setOpen] = useState(false)
  const [prevCount, setPrevCount] = useState(cart.length)
  const [shake, setShake] = useState(false)

  const prevCountRef = useRef(cart.length)

  useEffect(() => {
    if (cart.length > prevCountRef.current) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }

    prevCountRef.current = cart.length
  }, [cart.length])
  

  const closeMenu = () => setOpen(false)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-secondary/20 transition ${isActive ? 'bg-secondary/30' : ''
    }`

  return (
    <header className="sticky top-0 z-50 bg-primary text-secondary shadow-md">
      <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between py-3">
        <NavLink to="/" onClick={closeMenu} className="flex items-center space-x-2">
          <img
            src="/images/logo/noSignLogo.png"
            alt="Logo"
            className="h-10 rounded-md"
          />
          <span className="text-2xl md:text-lg font-bold">Бакалійний Двір</span>
        </NavLink>

        {/* mobile menu button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden relative focus:outline-none"
        >
          {/* червоний дот, якщо є товари */}
          {cart.length > 0 && !open && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 8h16M4 16h16" />
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
            {user ? (
              <>
                <NavLink to="/" onClick={closeMenu} className={linkClass}>
                  Головна
                </NavLink>

                <NavLink
                  to="/cart"
                  onClick={closeMenu}
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

                {user.role === 'admin' && (
                  <>
                    <NavLink to="/admin/products" onClick={closeMenu} className={linkClass}>
                      Товари
                    </NavLink>
                    <NavLink to="/admin/orders" onClick={closeMenu} className={linkClass}>
                      Замовлення
                    </NavLink>
                    <NavLink to="/admin/users" onClick={closeMenu} className={linkClass}>
                      Користувачі
                    </NavLink>
                  </>
                )}

                <button
                  onClick={() => { logout(); closeMenu() }}
                  className="px-3 py-2 rounded hover:bg-secondary/20 transition text-left"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu} className={linkClass}>
                  Вхід
                </NavLink>
                <NavLink to="/register" onClick={closeMenu} className={linkClass}>
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
