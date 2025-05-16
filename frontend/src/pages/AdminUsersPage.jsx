// frontend/src/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'user', direction: 'ascending' })
  const { addNotification } = useNotification()

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data))
      .catch(err => {
        console.error(err)
        addNotification('Помилка завантаження користувачів')
      })
  }, [])

  const computeDays = user => {
    if (user.role === 'admin') return Infinity
    const created = dayjs(user.createdAt)
    return Math.max(0, created.add(7, 'day').diff(dayjs(), 'day'))
  }

  const sortedUsers = useMemo(() => {
    const arr = [...users]
    arr.sort((a, b) => {
      let aKey, bKey
      switch (sortConfig.key) {
        case 'user':
          aKey = `${a.surname} ${a.phone}`.toLowerCase()
          bKey = `${b.surname} ${b.phone}`.toLowerCase()
          break
        case 'role':
          aKey = a.role
          bKey = b.role
          break
        case 'isApproved':
          aKey = a.isApproved ? 1 : 0
          bKey = b.isApproved ? 1 : 0
          break
        case 'days':
          aKey = computeDays(a)
          bKey = computeDays(b)
          break
        default:
          return 0
      }
      if (aKey < bKey) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aKey > bKey) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
    return arr
  }, [users, sortConfig])

  const requestSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { key, direction: 'ascending' }
    )
  }

  const getSortIndicator = key =>
    sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''

  const approveUser = async id => {
    try {
      const { data } = await api.patch(`/users/${id}/approve`)
      setUsers(prev => prev.map(u => (u._id === data._id ? data : u)))
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
      setUsers(prev => prev.filter(u => u._id !== id))
      addNotification('Користувача видалено')
    } catch {
      addNotification('Не вдалося видалити користувача')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Управління користувачами</h1>
      <div className="overflow-x-auto">
        <table className="table-fixed w-full border-collapse md:border border-gray-200 bg-white">
          <thead className="hidden md:table-header-group bg-gray-100">
            <tr>
              <th
                className="cursor-pointer px-4 py-2 w-1/3 text-left"
                onClick={() => requestSort('user')}
              >
                Користувач{getSortIndicator('user')}
              </th>
              <th
                className="cursor-pointer px-4 py-2 w-1/6 text-left"
                onClick={() => requestSort('role')}
              >
                Роль{getSortIndicator('role')}
              </th>
              <th
                className="cursor-pointer px-4 py-2 w-1/6 text-center"
                onClick={() => requestSort('isApproved')}
              >
                Підтв.{getSortIndicator('isApproved')}
              </th>
              <th
                className="cursor-pointer px-4 py-2 w-1/6 text-center"
                onClick={() => requestSort('days')}
              >
                Дн. дост.{getSortIndicator('days')}
              </th>
              <th className="px-4 py-2 w-1/6">Дія</th>
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
                  {/* Користувач */}
                  <td className="block md:table-cell px-4 py-2">
                    <span className="font-semibold md:hidden">Користувач: </span>
                    {u.surname}, {u.phone}
                  </td>
                  {/* Role */}
                  <td className="block md:table-cell px-4 py-2">
                    <span className="font-semibold md:hidden">Роль: </span>
                    {u.role}
                  </td>
                  {/* isApproved */}
                  <td className="block md:table-cell px-4 py-2 text-center">
                    <span className="font-semibold md:hidden">Підтв.: </span>
                    {u.isApproved ? '✔️' : '❌'}
                  </td>
                  {/* Days */}
                  <td className="block md:table-cell px-4 py-2 text-center">
                    <span className="font-semibold md:hidden">Дн. дост.: </span>
                    {days === Infinity ? '∞' : days}
                  </td>
                  {/* Actions */}
                  <td className="block md:table-cell px-4 py-2 text-center space-x-2">
                    {!u.isApproved && (
                      <button
                        onClick={() => approveUser(u._id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Підтвердити
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(u._id, u.role)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
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
    </div>
  )
}
