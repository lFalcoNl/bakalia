// frontend/src/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'role', direction: 'ascending' })
  const { addNotification } = useNotification()

  // Fetch users
  const fetchUsers = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch {
      addNotification('Помилка завантаження користувачів')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }
  useEffect(() => { fetchUsers() }, [])

  // compute days since registration (for sorting/display)
  const computeDays = u =>
    u.role === 'admin'
      ? Infinity
      : Math.max(0, dayjs().diff(dayjs(u.createdAt), 'day'))

  // Filter
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return users
    const t = searchTerm.toLowerCase()
    return users.filter(u =>
      u.surname.toLowerCase().includes(t) ||
      u.phone.includes(t) ||
      u.street.toLowerCase().includes(t)
    )
  }, [users, searchTerm])

  // Sort
  const sortedUsers = useMemo(() => {
    const arr = [...filtered]
    const getKey = u => {
      switch (sortConfig.key) {
        case 'user': return u.surname.toLowerCase()
        case 'phone': return u.phone
        case 'street': return u.street.toLowerCase()
        case 'role': return u.role
        case 'isApproved': return u.isApproved ? 1 : 0
        case 'days': return computeDays(u)
        default: return ''
      }
    }
    arr.sort((a, b) => {
      const aK = getKey(a), bK = getKey(b)
      if (aK < bK) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aK > bK) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
    return arr
  }, [filtered, sortConfig])

  const requestSort = key =>
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    }))
  const getSortIndicator = key =>
    sortConfig.key === key
      ? sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'
      : ''

  // Actions
  const approveUser = async id => {
    try {
      const { data } = await api.patch(`/users/${id}/approve`)
      setUsers(us => us.map(u => u._id === data._id ? data : u))
      addNotification('Користувача підтверджено')
    } catch {
      addNotification('Не вдалося підтвердити користувача')
    }
  }
  const deleteUser = async (id, role) => {
    if (role === 'admin') {
      addNotification('Неможливо видалити адміністратора')
      return
    }
    if (!window.confirm('Видалити користувача?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(us => us.filter(u => u._id !== id))
      addNotification('Користувача видалено')
    } catch {
      addNotification('Не вдалося видалити користувача')
    }
  }

  // Нові дії для скидання пароля
  const approveReset = async id => {
    try {
      await api.patch(`/auth/forgot-password/${id}/approve`)
      addNotification('Запит на скидання пароля підтверджено')
      fetchUsers()
    } catch {
      addNotification('Не вдалося підтвердити скидання пароля')
    }
  }
  const rejectReset = async id => {
    try {
      await api.patch(`/auth/forgot-password/${id}/reject`)
      addNotification('Запит на скидання пароля відхилено')
      fetchUsers()
    } catch {
      addNotification('Не вдалося відхилити скидання пароля')
    }
  }

  return (
    <div className="p-4">
      {/* Header + Refresh */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Управління користувачами</h1>
        <button
          onClick={fetchUsers}
          disabled={refreshing}
          aria-label="Оновити список"
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full p-2"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            initial={{ rotate: 0 }} animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.8, ease: 'linear' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 4v6h-6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 20v-6h6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.51 9a9 9 0 0114.36-3.36" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.49 15a9 9 0 01-14.36 3.36" />
          </motion.svg>
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Пошук за прізвищем, телефоном або адресою…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-full border py-2 px-4 rounded-full focus:outline-none"
      />

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження користувачів…</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table-auto min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('user')}>
                    Прізвище{getSortIndicator('user')}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('phone')}>
                    Телефон{getSortIndicator('phone')}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('street')}>
                    Адреса{getSortIndicator('street')}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('role')}>
                    Роль{getSortIndicator('role')}
                  </th>
                  <th className="px-4 py-2 text-center cursor-pointer" onClick={() => requestSort('isApproved')}>
                    Підтв.{getSortIndicator('isApproved')}
                  </th>
                  <th className="px-4 py-2 text-center cursor-pointer" onClick={() => requestSort('days')}>
                    Дні{getSortIndicator('days')}
                  </th>
                  <th className="px-4 py-2 text-center">Дії</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(u => {
                  const days = computeDays(u)
                  return (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-2">{u.surname}</td>
                      <td className="px-4 py-2">{u.phone}</td>
                      <td className="px-4 py-2">{u.street}</td>
                      <td className="px-4 py-2">{u.role}</td>
                      <td className="px-4 py-2 text-center">
                        {u.isApproved ? '✔️' : '❌'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {days === Infinity ? '∞' : days}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col items-end space-y-2">
                          {u.resetRequested && (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => approveReset(u._id)}
                                className="bg-blue-600 text-white px-2 py-1 hover:bg-red-600 rounded-full transition"
                              >
                                Скинути
                              </button>
                              <button
                                onClick={() => rejectReset(u._id)}
                                className="bg-yellow-600 text-white px-2 py-1 hover:bg-red-600 rounded-full transition"
                              >
                                Відхилити
                              </button>
                            </div>
                          )}

                          {!u.isApproved && (
                            <button
                              onClick={() => approveUser(u._id)}
                              className="bg-green-600 text-white px-2 py-1 hover:bg-red-600 rounded-full transition"
                            >
                              Підтвердити
                            </button>
                          )}

                          {u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(u._id, u.role)}
                              className="bg-red-500 text-white px-2 py-1 hover:bg-red-600 rounded-full transition"
                            >
                              Видалити
                            </button>
                          )}
                        </div>
                      </td>


                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {sortedUsers.map(u => {
              const days = computeDays(u)
              return (
                <div
                  key={u._id}
                  className="bg-white p-3 rounded shadow flex flex-col space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {u.surname} · {u.phone}
                      </div>
                    </div>

                    {/* Кнопки: адаптивно в ряд або колонку */}
                    <div className="flex flex-wrap justify-end gap-2">
                      {u.resetRequested && (
                        <>
                          <button
                            onClick={() => approveReset(u._id)}
                            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full"
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => rejectReset(u._id)}
                            className="w-8 h-8 flex items-center justify-center bg-yellow-600 text-white rounded-full"
                          >
                            ✖
                          </button>
                        </>
                      )}
                      {!u.isApproved && (
                        <button
                          onClick={() => approveUser(u._id)}
                          className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full"
                        >
                          ✔
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(u._id, u.role)}
                          className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full"
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">{u.street}</div>

                  <div className="flex justify-between text-xs text-gray-700">
                    <span>{u.role}</span>
                    <span>{days === Infinity ? '∞ дн.' : `${days} дн.`}</span>
                  </div>
                </div>

              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
