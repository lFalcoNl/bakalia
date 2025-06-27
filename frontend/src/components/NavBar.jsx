import React, { useContext, useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const { cart } = useCart()

  const [open, setOpen] = useState(false)
  const prevCountRef = useRef(cart.length)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (cart.length > prevCountRef.current) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 600)
      return () => clearTimeout(t)
    }
    prevCountRef.current = cart.length
  }, [cart.length])

  const toggleMenu = () => setOpen(o => !o)
  const closeMenu = () => setOpen(false)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md font-medium transition duration-200
     hover:bg-white/10 hover:text-white
     ${isActive ? 'bg-white/20 text-white' : 'text-secondary'}`

  return (
    <header className=" sticky top-0 z-50 bg-primary text-white shadow-md backdrop-blur-md">
      <div className="max-w-[1300px] mx-auto px-4 flex items-center justify-between py-3">
        {/* Logo */}
        <NavLink to="/" onClick={closeMenu} className="flex items-center space-x-3">
          <img src="/images/logo/noSignLogo.png" alt="Logo" className="h-10 rounded-md drop-shadow" />
          <span className="text-2xl text-secondary font-bold tracking-wide">Бакалійний Двір</span>
        </NavLink>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="lg:hidden relative text-secondary"
        >
          {!open && cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {cart.length}
            </span>
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>

        {/* Navigation */}
        <nav className={`
          ${open ? 'block' : 'hidden'}
          absolute top-full left-0 w-full bg-primary shadow-lg
          lg:static lg:block lg:w-auto lg:bg-transparent lg:shadow-none
        `}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 px-4 py-4 lg:p-0">

            {user ? (
              <>
                <NavLink to="/" onClick={closeMenu} className={linkClass}>
                  Головна
                </NavLink>

                <NavLink
                  to="/cart"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${linkClass({ isActive })} flex items-center space-x-2 ${shake ? 'animate-bounce' : ''}`
                  }
                >
                  <span>Корзина</span>
                  <span role="img" aria-label="cart">🛒</span>
                  {cart.length > 0 && (
                    <span className="ml-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
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
                  onClick={() => {
                    logout()
                    closeMenu()
                  }}
                  className="px-3 py-2 rounded-md hover:bg-white/10 transition flex items-center space-x-1 text-gray-300 hover:text-white"
                >
                  <span>Вихід</span>
                  <span>➡️</span>
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
