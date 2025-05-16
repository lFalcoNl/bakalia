import React, { createContext, useState, useEffect } from 'react'
import api from '../api/api'

const decodeToken = token => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      try {
        const decoded = decodeToken(token)
        setUser({
          id: decoded.id,
          role: decoded.role,
          surname: decoded.surname,
          phone: decoded.phone
        })
      } catch (err) {
        console.error('Invalid token:', err)
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password })
    const { token, user: payloadUser } = data
    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    setUser({
      id: payloadUser.id,
      role: payloadUser.role,
      surname: payloadUser.surname,
      phone: payloadUser.phone
    })
    return payloadUser
  }

  const register = async (surname, street, phone, password) => {
    return api.post('/auth/register', { surname, street, phone, password })
  }

  const logout = () => {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
