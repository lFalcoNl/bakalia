// frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [phone, setPhone] = useState('+380')
  const [password, setPassword] = useState('')

  const handlePhoneChange = e => {
    const val = e.target.value
    // Відбираємо тільки цифри
    const digitsAll = val.replace(/\D/g, '')
    // Якщо введено більше ніж 3 цифри, беремо ті що після коду 380, максимум 9 цифр
    let rest = ''
    if (digitsAll.length > 3) {
      rest = digitsAll.slice(3, 12)
    }
    // Завжди повертаємо '+380' + решта
    setPhone('+380' + rest)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(phone, password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Помилка при вході'
      addNotification(msg)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow max-w-md w-full space-y-6 border"
      >
        <h1 className="text-2xl font-bold text-center">Увійти</h1>
        <div className="space-y-4">
          <input
            type="tel"
            placeholder="+380XXXXXXXXX"
            value={phone}
            onChange={handlePhoneChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white rounded w-full py-2 hover:bg-green-700 transition"
        >
          Увійти
        </button>
        <div className="text-center text-sm">
          Немає аккаунту?{' '}
          <NavLink to="/register" className="text-green-600 hover:underline">
            Реєстрація
          </NavLink>
        </div>
      </form>
    </div>
  )
}
