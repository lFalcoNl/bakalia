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
  const [sortConfig, setSortConfig] = useState({
    key: 'role',
    direction: 'ascending',
  })
  const { addNotification } = useNotification()

  // Fetch users (initial + manual)
  const fetchUsers = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err) {
      console.error(err)
      addNotification('Помилка завантаження користувачів')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    fetchUsers?.().finally(() => {
      if (!isMounted) return
      // safe to set state here
    })

    return () => {
      isMounted = false
    }
  }, [])



  const computeDays = u => {
    if (u.role === 'admin') return Infinity
    return Math.max(0, dayjs().diff(dayjs(u.createdAt), 'day'))
  }


  // 1) filter by searchTerm
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return users
    const term = searchTerm.toLowerCase()
    return users.filter(u =>
      u.surname.toLowerCase().includes(term) ||
      u.phone.includes(term)
    )
  }, [users, searchTerm])

  // 2) sort filtered list
  const sortedUsers = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let aKey, bKey
      switch (sortConfig.key) {
        case 'user':
          aKey = a.surname.toLowerCase()
          bKey = b.surname.toLowerCase()
          if (aKey === bKey) {
            aKey = a.phone; bKey = b.phone
          }
          break
        case 'role':
          aKey = a.role; bKey = b.role
          break
        case 'isApproved':
          aKey = a.isApproved ? 1 : 0; bKey = b.isApproved ? 1 : 0
          break
        case 'days':
          aKey = computeDays(a); bKey = computeDays(b)
          break
        default:
          return 0
      }
      if (aKey < bKey) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aKey > bKey) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
    return arr
  }, [filtered, sortConfig])

  const requestSort = key =>
    setSortConfig(prev =>
      prev.key === key
        ? {
          key,
          direction: prev.direction === 'ascending'
            ? 'descending'
            : 'ascending',
        }
        : { key, direction: 'ascending' }
    )

  const getSortIndicator = key =>
    sortConfig.key === key
      ? sortConfig.direction === 'ascending'
        ? ' ▲'
        : ' ▼'
      : ''

  const approveUser = async id => {
    try {
      const { data } = await api.patch(`/users/${id}/approve`)
      setUsers(us => us.map(u => (u._id === data._id ? data : u)))
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

  return (
    <div className="p-4">
      {/* Header + refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Управління користувачами</h1>
        <button
          onClick={fetchUsers}
          disabled={refreshing}
          aria-label="Оновити список користувачів"
          className="
            inline-flex items-center justify-center
            bg-green-600 hover:bg-green-700 disabled:opacity-50
            text-white rounded-full p-2 focus:outline-none
          "
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ rotate: 0 }}
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.8, ease: 'linear' }}
          >
            {/* arrow tip right/down */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 4v6h-6" />
            {/* arrow tip left/up */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 20v-6h6" />
            {/* top‐right arc */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.51 9a9 9 0 0114.36-3.36" />
            {/* bottom‐left arc */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.49 15a9 9 0 01-14.36 3.36" />
          </motion.svg>
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Пошук за прізвищем або телефоном…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-full border p-2 rounded focus:outline-none"
      />

      {/* Initial loading */}
      {loading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження користувачів…</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-fixed w-full bg-white text-sm">
            {/* Desktop headers */}
            <thead className="hidden md:table-header-group bg-gray-100 text-gray-700">
              <tr>
                <th
                  className="px-4 py-2 w-1/3 text-left cursor-pointer"
                  onClick={() => requestSort('user')}
                >
                  Користувач<span className="ml-1">{getSortIndicator('user')}</span>
                </th>
                <th
                  className="px-4 py-2 w-1/6 text-left cursor-pointer"
                  onClick={() => requestSort('role')}
                >
                  Роль<span className="ml-1">{getSortIndicator('role')}</span>
                </th>
                <th
                  className="px-4 py-2 w-1/6 text-center cursor-pointer"
                  onClick={() => requestSort('isApproved')}
                >
                  Підтв.<span className="ml-1">{getSortIndicator('isApproved')}</span>
                </th>
                <th
                  className="px-4 py-2 w-1/6 text-center cursor-pointer"
                  onClick={() => requestSort('days')}
                >
                  Дн. дост.<span className="ml-1">{getSortIndicator('days')}</span>
                </th>
                <th className="px-4 py-2 w-1/6 text-center">Дія</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(u => {
                const days = computeDays(u)
                return (
                  <tr
                    key={u._id}
                    className="block md:table-row mb-4 md:mb-0 bg-white md:bg-transparent border md:border-0 md:border-t"
                  >
                    <td className="block md:table-cell px-4 py-2">
                      <div className="flex flex-col space-y-2">
                        <div>
                          <span className="font-semibold md:hidden">Прізвище:&nbsp;</span>
                          {u.surname}
                        </div>
                        <div>
                          <span className="font-semibold md:hidden">Телефон:&nbsp;</span>
                          {u.phone}
                        </div>
                        <div>
                          <span className="font-semibold md:hidden">Адреса:&nbsp;</span>
                          {u.street}
                        </div>
                      </div>
                    </td>
                    <td className="block md:table-cell px-4 py-2">
                      <span className="font-semibold md:hidden">Роль: </span>
                      {u.role}
                    </td>
                    <td className="block md:table-cell px-4 py-2 text-center">
                      <span className="font-semibold md:hidden">Підтв.: </span>
                      {u.isApproved ? '✔️' : '❌'}
                    </td>
                    <td className="block md:table-cell px-4 py-2 text-center">
                      <span className="font-semibold md:hidden">Дн. дост.: </span>
                      {days === Infinity ? '∞' : days}
                    </td>
                    <td className="block md:table-cell px-4 py-2 text-center space-x-2 text-end">
                      {!u.isApproved && (
                        <button
                          onClick={() => approveUser(u._id)}
                          className="bg-green-600 my-2 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition"
                        >
                          Підтвердити
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(u._id, u.role)}
                          className="bg-red-600 my-2 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
                        >
                          Видалити
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
