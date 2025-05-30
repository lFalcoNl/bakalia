// frontend/src/pages/AdminOrdersPage.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { AuthContext } from '../context/AuthContext'

export default function AdminOrdersPage() {
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()

  // state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [searchTerm, setSearchTerm] = useState('')

  // helpers
  const round1 = n => Math.round(n * 10) / 10
  const statuses = [
    { value: 'new', label: 'Нове' },
    { value: 'processing', label: 'В обробці' },
    { value: 'done', label: 'Виконано' },
  ]
  const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  // fetch orders
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(Array.isArray(data) ? data : data.orders ?? [])
    } catch {
      addNotification('Помилка завантаження замовлень')
    } finally {
      setOrdersLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    if (user?.role !== 'admin') return
    fetchOrders()
  }, [user?.role, fetchOrders])


  if (!user) return null
  if (user.role !== 'admin') return <p>Доступ заборонено</p>

  // actions
  const changeStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/orders/${id}`, { status })
      setOrders(prev => prev.map(o => (o._id === id ? data : o)))
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
      setOrders(prev => prev.map(o => (o._id === orderId ? data : o)))
      addNotification('Товар видалено з замовлення')
    } catch {
      addNotification('Не вдалося видалити товар із замовлення')
    }
  }

  // compute totals
  const computeSubtotal = item =>
    round1((item.product?.price ?? item.productId?.price ?? 0) * item.quantity)
  const computeTotal = order =>
    round1(order.products.reduce((sum, p) => sum + computeSubtotal(p), 0))

  // sorting
  const requestSort = key =>
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  const getSortIndicator = key =>
    sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''

  const sortedOrders = useMemo(() => {
    const arr = [...orders]
    const factor = sortConfig.direction === 'asc' ? 1 : -1

    arr.sort((a, b) => {
      let cmp = 0
      switch (sortConfig.key) {
        case 'date':
          cmp = new Date(a.createdAt) - new Date(b.createdAt)
          break
        case 'user': {
          const getKey = o => ((o.user ?? o.userId)?.surname ?? '').toLowerCase()
          cmp = getKey(a).localeCompare(getKey(b))
          break
        }
        case 'total':
          cmp = computeTotal(a) - computeTotal(b)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        default:
          return 0
      }
      return cmp * factor
    })

    return arr
  }, [orders, sortConfig])

  // filtering
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return sortedOrders
    const term = searchTerm.toLowerCase()
    return sortedOrders.filter(o => {
      const u = o.user ?? o.userId ?? {}
      const surname = u.surname ?? '—'
      const phone = u.phone ?? '—'
      const street = u.street ?? '—'
      const userInfo = `${surname} ${phone} ${street}`.toLowerCase()

      if (userInfo.includes(term)) return true
      if (computeTotal(o).toString().includes(term)) return true
      if (o.status.includes(term)) return true
      if (statuses.some(s => s.value === o.status && s.label.toLowerCase().includes(term))) return true
      return o.products.some(p => (p.product?.name || p.productId?.name || '').toLowerCase().includes(term))
    })
  }, [searchTerm, sortedOrders, statuses])

  return (
    <div className="p-4">
      {/* Header + Refresh */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Управління замовленнями</h1>
        <button
          onClick={fetchOrders}
          disabled={ordersLoading}
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full p-2"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ rotate: 0 }}
            animate={ordersLoading ? { rotate: 360 } : { rotate: 0 }}
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
        placeholder="Пошук за користувачем, статусом, товаром…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded focus:outline-none"
      />

      {/* Loading */}
      {ordersLoading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження…</p>
        </div>
      ) : (
        <>
          {/* Table for Desktop (≥1024px) */}
          <motion.div className="hidden lg:block overflow-x-auto" initial="hidden" animate="visible" variants={listVariants}>
            <table className="w-full table-fixed bg-white rounded shadow-sm text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th onClick={() => requestSort('date')} className="w-32 px-4 py-2 cursor-pointer">
                    Дата{getSortIndicator('date')}
                  </th>
                  <th onClick={() => requestSort('user')} className="w-40 px-4 py-2 cursor-pointer">
                    Користувач{getSortIndicator('user')}
                  </th>
                  <th className="w-1/3 px-4 py-2">Товари</th>
                  <th onClick={() => requestSort('total')} className="w-24 px-4 py-2 text-right cursor-pointer">
                    Сума{getSortIndicator('total')}
                  </th>
                  <th onClick={() => requestSort('status')} className="w-32 px-4 py-2 text-center cursor-pointer">
                    Статус{getSortIndicator('status')}
                  </th>
                  <th className="w-24 px-4 py-2 text-center">Дія</th>
                </tr>
              </thead>
              <motion.tbody variants={listVariants}>
                {filteredOrders.map(o => {
                  const total = computeTotal(o)
                  const u = o.user ?? o.userId ?? {}
                  const surname = u.surname ?? '—'
                  const phone = u.phone ?? '—'
                  const street = u.street ?? u.address?.street ?? '—'
                  const userInfo = `${surname}, ${phone}, ${street}`

                  return (
                    <motion.tr key={o._id} className="border-t hover:bg-gray-50" variants={itemVariants}>
                      <td className="px-4 py-2">{dayjs(o.createdAt).format('DD.MM.YYYY HH:mm')}</td>
                      <td className="px-4 py-2">{userInfo}</td>
                      <td className="px-4 py-2 whitespace-normal max-h-32 overflow-y-auto">
                        <ul className="divide-y divide-gray-200 space-y-1">
                          {o.products.map((p, i) => {
                            const name = p.product?.name || p.productId?.name || '—'
                            const prodId = p.product?._id || p.productId?._id
                            const price = p.product?.price || p.productId?.price
                            return (
                              <li key={i} className="flex justify-between items-start">
                                <span className="flex-1 pr-4 break-words">
                                  {name}
                                </span>

                                <div className="flex items-center space-x-3">  {/* ← items-center */}
                                  <div className="text-right">
                                    <div className="text-sm font-medium">
                                      {computeSubtotal(p)} ₴
                                    </div>
                                    <div className="text-xs text-gray-600 font-bold">
                                      [{round1(computeSubtotal(p) / price)}×{price}₴]
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => removeItem(o._id, prodId)}
                                    className="text-red-600 hover:underline text-sm"
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
                          Видалити
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </motion.div>

          {/* Card view for everything below desktop */}
          <motion.div className="lg:hidden space-y-4" initial="hidden" animate="visible" variants={listVariants}>
            {filteredOrders.map(o => {
              const total = computeTotal(o)
              const u = o.user ?? o.userId ?? {}
              const surname = u.surname ?? '—'
              const phone = u.phone ?? '—'
              const street = u.street ?? u.address?.street ?? '—'
              const userInfo = `${surname}, ${phone}, ${street}`

              return (
                <motion.div key={o._id} className="bg-white rounded shadow-sm p-4" variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      {dayjs(o.createdAt).format('DD.MM.YYYY HH:mm')}
                    </span>
                    <button onClick={() => deleteOrder(o._id)} className="text-red-600 text-sm hover:underline">
                      Видалити
                    </button>
                  </div>
                  <div className="mb-2 font-semibold">{userInfo}</div>
                  <ul className="divide-y divide-gray-200 mb-2 text-sm text-gray-700 space-y-1">
                    {o.products.map((p, i) => {
                      const name = p.product?.name || p.productId?.name || '—'
                      const prodId = p.product?._id || p.productId?._id
                      const price = p.product?.price || p.productId?.price
                      return (
                        <li
                          key={i}
                          className="flex justify-between items-start py-2 border-b border-gray-200"
                        >
                          {/* LEFT: Name */}
                          <span className="flex-1 pr-4 break-words">
                            {name}
                          </span>

                          {/* RIGHT: Price + formula stacked, with × button */}
                          <div className="flex items-start space-x-4">
                            {/* two-line block, right-aligned */}
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {computeSubtotal(p)} ₴
                              </div>
                              <div className="text-xs text-gray-600 font-bold">
                                [{round1(computeSubtotal(p) / price)}×{price}₴]
                              </div>
                            </div>

                            {/* delete button, vertically centered next to the two-line block */}
                            <button
                              onClick={() => removeItem(o._id, prodId)}
                              className="self-center text-red-600 hover:underline text-sm"
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
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}
    </div>
  )
}
