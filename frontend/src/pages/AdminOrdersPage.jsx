import React, { useState, useEffect, useMemo, useContext } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { AuthContext } from '../context/AuthContext'

export default function AdminOrdersPage() {
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const [orders, setOrders] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  // Задати маппінг статусів
  const statuses = [
    { value: 'new', label: 'Нове' },
    { value: 'processing', label: 'В обробці' },
    { value: 'done', label: 'Виконано' }
  ]

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => addNotification('Помилка завантаження замовлень'))
  }, [])

  if (!user) return null
  if (user.role !== 'admin') return <p>Доступ заборонено</p>

  const changeStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/orders/${id}`, { status })
      setOrders(prev => prev.map(o => o._id === id ? data : o))
      addNotification('Статус оновлено')
    } catch {
      addNotification('Не вдалося оновити статус')
    }
  }

  const deleteOrder = async id => {
    if (!window.confirm('Видалити замовлення?')) return
    try {
      await api.delete(`/orders/${id}`)
      setOrders(prev => prev.filter(o => o._id !== id))
      addNotification('Замовлення видалено')
    } catch {
      addNotification('Не вдалося видалити замовлення')
    }
  }

  const removeItem = async (orderId, productId) => {
    if (!window.confirm('Видалити цей товар з замовлення?')) return
    try {
      const { data } = await api.delete(`/orders/${orderId}/products/${productId}`)
      setOrders(prev => prev.map(o => o._id === orderId ? data : o))
      addNotification('Товар видалено з замовлення')
    } catch {
      addNotification('Не вдалося видалити товар із замовлення')
    }
  }

  const computeSubtotal = item =>
    (item.product?.price ?? item.productId?.price ?? 0) * item.quantity

  const computeTotal = order =>
    order.products.reduce((sum, p) => sum + computeSubtotal(p), 0)

  const requestSort = key =>
    setSortConfig(prev => (
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    ))

  const getSortIndicator = key =>
    sortConfig.key === key
      ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')
      : ''

  const sortedOrders = useMemo(() => {
    const arr = [...orders]
    arr.sort((a, b) => {
      let A, B
      switch (sortConfig.key) {
        case 'date':
          A = new Date(a.createdAt); B = new Date(b.createdAt); break
        case 'user':
          A = (a.user
            ? `${a.user.surname} ${a.user.phone}`
            : a.userId
              ? `${a.userId.surname} ${a.userId.phone}`
              : ''
          ).toLowerCase()
          B = (b.user
            ? `${b.user.surname} ${b.user.phone}`
            : b.userId
              ? `${b.userId.surname} ${b.userId.phone}`
              : ''
          ).toLowerCase()
          break
        case 'total':
          A = computeTotal(a); B = computeTotal(b); break
        case 'status':
          A = a.status; B = b.status; break
        default:
          return 0
      }
      if (A < B) return sortConfig.direction === 'asc' ? -1 : 1
      if (A > B) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [orders, sortConfig])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Управління замовленнями</h1>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto bg-white rounded shadow-sm text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th onClick={() => requestSort('date')} className="px-4 py-2 cursor-pointer">
                Дата{getSortIndicator('date')}
              </th>
              <th onClick={() => requestSort('user')} className="px-4 py-2 cursor-pointer">
                Користувач{getSortIndicator('user')}
              </th>
              <th className="px-4 py-2">Товари</th>
              <th onClick={() => requestSort('total')} className="px-4 py-2 text-right cursor-pointer">
                Загальна сума{getSortIndicator('total')}
              </th>
              <th onClick={() => requestSort('status')} className="px-4 py-2 text-center cursor-pointer">
                Статус{getSortIndicator('status')}
              </th>
              <th className="px-4 py-2 text-center">Дія</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map(o => {
              const total = computeTotal(o)
              const userInfo = o.user
                ? `${o.user.surname}, ${o.user.phone}`
                : o.userId
                  ? `${o.userId.surname}, ${o.userId.phone}`
                  : '—'
              return (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {dayjs(o.createdAt).format('DD.MM.YYYY HH:mm')}
                  </td>
                  <td className="px-4 py-2">{userInfo}</td>
                  <td className="px-4 py-2">
                    <ul className="space-y-1">
                      {o.products.map((p, i) => {
                        const name = p.product?.name || p.productId?.name || '—'
                        const sub = (p.product?.price || p.productId?.price || 0) * p.quantity
                        return (
                          <li key={i} className="flex justify-between items-center">
                            <span className="flex-1">{name} × {p.quantity}</span>
                            <div className="flex items-center space-x-2">
                              <span>{sub} ₴</span>
                              <button
                                onClick={() => removeItem(o._id, p.productId)}
                                className="text-red-600 hover:underline"
                              >
                                ×
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">{total} ₴</td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={o.status}
                      onChange={e => changeStatus(o._id, e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      {statuses.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => deleteOrder(o._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                    >
                      Видалити замовлення
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Мобільний вигляд */}
      <div className="md:hidden space-y-4">
        {sortedOrders.map(o => {
          const total = computeTotal(o)
          const userInfo = o.user
            ? `${o.user.surname}, ${o.user.phone}`
            : o.userId
              ? `${o.userId.surname}, ${o.userId.phone}`
              : '—'
          return (
            <div key={o._id} className="bg-white rounded shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  {dayjs(o.createdAt).format('DD.MM.YYYY')}
                </span>
                <button
                  onClick={() => deleteOrder(o._id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Видалити
                </button>
              </div>
              <div className="mb-2 font-semibold">{userInfo}</div>
              <ul className="mb-2 text-sm text-gray-700 space-y-1">
                {o.products.map((p, i) => {
                  const name = p.product?.name || p.productId?.name || '—'
                  const sub = (p.product?.price || p.productId?.price || 0) * p.quantity
                  return (
                    <li key={i} className="flex justify-between items-center">
                      <span>{name} × {p.quantity}</span>
                      <div className="flex items-center space-x-2">
                        <span>{sub} ₴</span>
                        <button
                          onClick={() => removeItem(o._id, p.productId)}
                          className="text-red-600 hover:underline"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="flex justify-between items-center mb-2">
                <span>Всього:</span>
                <span className="font-semibold">{total} ₴</span>
              </div>
              <select
                value={o.status}
                onChange={e => changeStatus(o._id, e.target.value)}
                className="w-full border px-2 py-1 rounded text-sm"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
