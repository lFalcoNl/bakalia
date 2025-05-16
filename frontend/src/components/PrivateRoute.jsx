import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useContext(AuthContext)

  if (!user) {
    // Неавторизовані — на /login
    return <Navigate to="/login" replace />
  }
  if (adminOnly && user.role !== 'admin') {
    // Не admin — заборонено
    return <p>Доступ заборонено</p>
  }
  return children
}
