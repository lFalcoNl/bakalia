// frontend/src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Функція логауту
  const logout = useCallback(() => {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('token')
    setUser(null)
    navigate('/register', { replace: true })
  }, [navigate])

  // Перевірка токена на стартапі
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [logout])

  // Інтерцептор для 401
  useEffect(() => {
    const id = api.interceptors.response.use(
      resp => resp,
      err => {
        if (err.response?.status === 401) {
          logout()
        }
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [logout])

  // Функція логіну
  const login = async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password })
    const { token, user: payload } = data

    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    setUser(payload)
    navigate('/', { replace: true })

    return payload
  }

  // Функція реєстрації (приймає об’єкт)
  const register = ({ surname, street, phone, password }) => {
    return api.post('/auth/register', { surname, street, phone, password })
  }

  // Поки перевіряємо token – нічого не рендеримо
  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
