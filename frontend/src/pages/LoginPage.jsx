import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      // Якщо сервер повернув статус 403 → акаунт не підтверджено
      const status = err.response?.status
      const serverMsg = err.response?.data?.message
      if (status === 403) {
        addNotification(serverMsg || 'Очікуйте підтвердження адміністратора.')
      } else {
        // інші помилки (400, 500 тощо)
        addNotification(serverMsg || 'Невдала спроба входу.')
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow max-w-md w-full space-y-4 border"
      >
        <h1 className="text-xl font-bold text-center">Вхід</h1>
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
        <button
          type="submit"
          className="bg-green-600 text-white rounded w-full py-2 hover:bg-opacity-90"
        >
          Увійти
        </button>
      </form>
    </div>
  )
}
