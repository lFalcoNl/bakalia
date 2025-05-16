// frontend/src/pages/LoginPage.jsx
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
      console.error('Login failed', err)
      addNotification(err.response?.data?.msg || 'Помилка при вході')
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
          className="bg-green-600 text-white rounded w-full py-2 hover:bg-green-700 transition"
        >
          Увійти
        </button>
      </form>
    </div>
  )
}
