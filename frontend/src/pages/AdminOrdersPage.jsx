import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const { addNotification } = useNotification()

  // Стан сортування
  const [sortConfig, setSortConfig] = useState({
    key: 'user',
    direction: 'ascending',
  })

  useEffect(() => {
    api
      .get('/orders')
      .then(r => setOrders(r.data))
      .catch(err => {
        console.error(err)
        addNotification('Помилка завантаження замовлень')
      })
  }, [])

  // Оновити статус
  const changeStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/orders/${id}`, { status })
      setOrders(prev =>
        prev.map(o => (o._id === id ? data : o))
      )
      addNotification('Статус оновлено')
    } catch (err) {
      console.error(err)
      addNotification('Не вдалося оновити статус')
    }
  }

  // Видалити замовлення
  const deleteOrder = async id => {
    if (!window.confirm('Видалити замовлення?')) return
    try {
      await api.delete(`/orders/${id}`)
      setOrders(prev => prev.filter(o => o._id !== id))
      addNotification('Замовлення видалено')
    } catch (err) {
      console.error(err)
      addNotification('Не вдалося видалити замовлення')
    }
  }

  // Розрахунок суми
  const computeTotal = o =>
    o.products.reduce(
      (sum, p) =>
        sum + (p.productId ? p.productId.price * p.quantity : 0),
      0
    )

  // Сортування списку
  const sortedOrders = useMemo(() => {
    const arr = [...orders]
    arr.sort((a, b) => {
      let aKey, bKey
      switch (sortConfig.key) {
        case 'user':
          aKey = a.userId?.email?.toLowerCase() || ''
          bKey = b.userId?.email?.toLowerCase() || ''
          break
        case 'total':
          aKey = computeTotal(a)
          bKey = computeTotal(b)
          break
        case 'status':
          aKey = a.status
          bKey = b.status
          break
        default:
          return 0
      }
      if (aKey < bKey) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aKey > bKey) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
    return arr
  }, [orders, sortConfig])

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Управління замовленнями</h1>

      <div className="overflow-x-auto">
        <table className="table-fixed w-full border border-gray-200 bg-white text-sm">
          {/* Заголовок тільки на десктопі */}
          <thead className="hidden md:table-header-group bg-gray-100">
            <tr>
              <th
                className="cursor-pointer px-4 py-2 w-1/3 text-left"
                onClick={() => requestSort('user')}
              >
                Користувач{getSortIndicator('user')}
              </th>
              <th className="px-4 py-2 w-2/5 text-left">Товари</th>
              <th
                className="cursor-pointer px-4 py-2 w-1/5 text-right"
                onClick={() => requestSort('total')}
              >
                Сума{getSortIndicator('total')}
              </th>
              <th
                className="cursor-pointer px-4 py-2 w-1/5 text-center"
                onClick={() => requestSort('status')}
              >
                Статус{getSortIndicator('status')}
              </th>
              <th className="px-4 py-2 w-1/5 text-center">Дія</th>
            </tr>
          </thead>

          <tbody className="block md:table-row-group">
            {sortedOrders.length === 0 ? (
              <tr className="block md:table-row">
                <td className="block md:table-cell px-4 py-2 text-center" colSpan="5">
                  Немає замовлень
                </td>
              </tr>
            ) : (
              sortedOrders.map(o => {
                const total = computeTotal(o)
                return (
                  <tr
                    key={o._id}
                    className="block md:table-row mb-4 md:mb-0 bg-white md:bg-transparent border md:border-0 md:border-t"
                  >
                    {/* Користувач */}
                    <td className="block md:table-cell px-4 py-2 whitespace-nowrap">
                      <span className="font-semibold md:hidden">Користувач: </span>
                      {o.userId?.email || '—'}
                    </td>
                    {/* Товари */}
                    <td className="block md:table-cell px-4 py-2">
                      <span className="font-semibold md:hidden">Товари: </span>
                      <div className="space-y-1 text-left">
                        {o.products.map((p, i) => (
                          <div key={i} className="whitespace-nowrap">
                            {p.productId
                              ? `${p.productId.name} x ${p.quantity}`
                              : '—'}
                          </div>
                        ))}
                      </div>
                    </td>
                    {/* Сума */}
                    <td className="block md:table-cell px-4 py-2 text-right whitespace-nowrap">
                      <span className="font-semibold md:hidden">Сума: </span>
                      {total} ₴
                    </td>
                    {/* Статус */}
                    <td className="block md:table-cell px-4 py-2 text-center whitespace-nowrap">
                      <span className="font-semibold md:hidden">Статус: </span>
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="new">new</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="done">done</option>
                      </select>
                    </td>
                    {/* Дія */}
                    <td className="block md:table-cell px-4 py-2 text-center">
                      <button
                        onClick={() => deleteOrder(o._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
