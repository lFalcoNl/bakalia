// frontend/src/pages/RegisterPage.jsx
import React, { useState, useContext } from 'react'
import { useNotification } from '../context/NotificationContext'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, NavLink } from 'react-router-dom'

export default function RegisterPage() {
  const { register } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [surname, setSurname] = useState('')
  const [street, setStreet] = useState('')
  const [phone, setPhone] = useState('+380')
  const [password, setPassword] = useState('')

  const handlePhoneChange = e => {
    const val = e.target.value
    // Витягаємо лише цифри
    const digitsAll = val.replace(/\D/g, '')
    // Беремо все, що після коду 380, максимум 9 цифр
    let rest = ''
    if (digitsAll.length > 3) {
      rest = digitsAll.slice(3, 12)
    }
    // Завжди формуємо '+380' + решта
    setPhone('+380' + rest)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const { data } = await register(surname, street, phone, password)
      addNotification(data.message || 'Зареєстровано успішно')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Помилка при реєстрації'
      addNotification(msg)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow max-w-md w-full space-y-6 border"
      >
        <h1 className="text-2xl font-bold text-center">Реєстрація</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Прізвище"
            value={surname}
            onChange={e => setSurname(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Адреса"
            value={street}
            onChange={e => setStreet(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
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
          Зареєструватися
        </button>

        <div className="text-center text-sm">
          Вже є аккаунт?{' '}
          <NavLink to="/login" className="text-green-600 hover:underline">
            Увійти
          </NavLink>
        </div>
      </form>
    </div>
  )
}
