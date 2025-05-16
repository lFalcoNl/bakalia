import React, { useState, useContext } from 'react'
import { useNotification } from '../context/NotificationContext'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const { register } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [surname, setSurname] = useState('')
  const [street, setStreet] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const { data } = await register(surname, street, phone, password)
      addNotification(data.message || 'Зареєстровано успішно')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Помилка при реєстрації'
      addNotification(msg)
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
          type="text"
          placeholder="Прізвище"
          value={surname}
          onChange={e => setSurname(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Вулиця"
          value={street}
          onChange={e => setStreet(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="tel"
          placeholder="Номер телефону"
          value={phone}
          onChange={e => setPhone(e.target.value)}
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
