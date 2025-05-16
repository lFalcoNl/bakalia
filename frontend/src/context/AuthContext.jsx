// frontend/src/context/AuthContext.jsx
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
        setUser({ id: decoded.id, role: decoded.role, email: decoded.email })
      } catch (err) {
        console.error('Invalid token:', err)
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const token = data.token
    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    const decoded = decodeToken(token)
    setUser({ id: decoded.id, role: decoded.role, email: decoded.email })
    return data.user
  }

  const register = (email, password) =>
    api.post('/auth/register', { email, password })

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
