import React, { useState } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { email, password })
      addNotification('Зареєстровано успішно')
      navigate('/login')
    } catch (err) {
      // Викликаємо повідомлення лише тут, інтерцептор по цій точці не спрацьовуватиме
      const message =
        err.response?.data?.message || err.response?.data?.msg || 'Помилка при реєстрації'
      addNotification(message)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow max-w-md w-full space-y-4 border"
      >
        <h1 className="text-xl font-bold text-center">Реєстрація</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
        <button type="submit" className="border p-2 rounded w-full">
          Зареєструватися
        </button>
      </form>
    </div>
  )
}
