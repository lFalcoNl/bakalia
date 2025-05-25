// frontend/src/pages/AdminProductsPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { categories } from '../constants/categories'
import { useNavigate } from 'react-router-dom'

export default function AdminProductsPage() {
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Search filter
  const [search, setSearch] = useState('')

  // Add‐form state
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0].name,
    minOrder: 1
  })
  const [file, setFile] = useState(null)

  // Edit‐form state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editFile, setEditFile] = useState(null)

  // Initial load
  useEffect(() => {
    setProductsLoading(true)
    api.get('/products')
      .then(r => setProducts(r.data))
      .catch(() => addNotification('Помилка завантаження товарів'))
      .finally(() => setProductsLoading(false))
  }, [addNotification])

  // Manual refresh
  const refreshProducts = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.get('/products')
      setProducts(data)
    } catch {
      addNotification('Помилка завантаження товарів')
    } finally {
      setRefreshing(false)
    }
  }

  // Add a product
  const handleAdd = async e => {
    e.preventDefault()
    try {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => body.append(k, v))
      if (file) body.append('image', file)

      // Axios auto‐detects FormData → multipart/form-data
      const { data: newProd } = await api.post('/products', body)
      setProducts([newProd, ...products])
      setForm({ name: '', price: '', category: categories[0].name, minOrder: 1 })
      setFile(null)
      addNotification('Товар додано')
    } catch {
      addNotification('Помилка при додаванні')
    }
  }

  // Delete a product
  const deleteProduct = async id => {
    if (!window.confirm('Видалити товар?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p._id !== id))
      addNotification('Товар видалено')
    } catch {
      addNotification('Не вдалося видалити товар')
    }
  }

  // Begin editing
  const startEdit = p => {
    setEditingId(p._id)
    setEditForm({
      name: p.name,
      price: p.price,
      category: p.category,
      minOrder: p.minOrder
    })
    setEditFile(null)
  }
  const cancelEdit = () => setEditingId(null)
  const handleEditChange = e => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  // Save edits
  const saveEdit = async id => {
    try {
      const body = new FormData()
      Object.entries(editForm).forEach(([k, v]) => body.append(k, v))
      if (editFile) body.append('image', editFile)

      const { data: updated } = await api.put(`/products/${id}`, body)
      setProducts(products.map(p => (p._id === id ? updated : p)))
      setEditingId(null)
      addNotification('Товар оновлено')
    } catch {
      addNotification('Не вдалося оновити товар')
    }
  }

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' })
  const requestSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }
  const getSortIndicator = key =>
    sortConfig.key === key
      ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')
      : ''
  const sortedProducts = useMemo(() => {
    const arr = [...products]
    arr.sort((a, b) => {
      let A, B
      switch (sortConfig.key) {
        case 'name':
          A = a.name.toLowerCase(); B = b.name.toLowerCase(); break
        case 'category':
          A = a.category.toLowerCase(); B = b.category.toLowerCase(); break
        case 'price':
        case 'minOrder':
          A = a[sortConfig.key]; B = b[sortConfig.key]; break
        case 'updatedAt':
          A = new Date(a.updatedAt).getTime()
          B = new Date(b.updatedAt).getTime(); break
        default:
          return 0
      }
      if (A < B) return sortConfig.direction === 'asc' ? -1 : 1
      if (A > B) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [products, sortConfig])

  // Search filter
  const displayed = useMemo(() => {
    if (!search.trim()) return sortedProducts
    return sortedProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, sortedProducts])

  return (
    <div className="p-4 flex flex-col min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Управління товарами</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/admin/print')}
            aria-label="Переглянути друковану таблицю"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
          >
            {/* printer icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12" />
            </svg>
          </button>
          <button
            onClick={refreshProducts}
            disabled={refreshing}
            aria-label="Оновити товари"
            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full p-2"
          >
            <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" initial={{ rotate: 0 }}
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.36-3.36 M20.49 15a9 9 0 01-14.36 3.36" />
            </motion.svg>
          </button>
        </div>
      </div>

      {/* ADD FORM */}
      <form onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          name="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Назва"
          className="border p-2 rounded"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          placeholder="Ціна"
          className="border p-2 rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded"
        >
          {categories.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input
          name="minOrder"
          type="number"
          min="1"
          value={form.minOrder}
          onChange={e => setForm({ ...form, minOrder: e.target.value })}
          placeholder="Мін. кількість"
          className="border p-2 rounded"
          required
        />
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          className="border p-2 rounded col-span-full"
        />
        <button
          type="submit"
          className="col-span-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Додати товар
        </button>
      </form>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Пошук за назвою…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full border p-2 rounded"
      />

      {/* TABLE OR LOADER */}
      {productsLoading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження товарів…</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2">Фото</th>
                <th onClick={() => requestSort('name')}
                  className="p-2 cursor-pointer">Назва{getSortIndicator('name')}</th>
                <th onClick={() => requestSort('category')}
                  className="p-2 cursor-pointer">Категорія{getSortIndicator('category')}</th>
                <th onClick={() => requestSort('price')}
                  className="p-2 text-right cursor-pointer">Ціна{getSortIndicator('price')}</th>
                <th onClick={() => requestSort('minOrder')}
                  className="p-2 text-center cursor-pointer">Мін. кількість{getSortIndicator('minOrder')}</th>
                <th onClick={() => requestSort('updatedAt')}
                  className="p-2 cursor-pointer">Оновлено{getSortIndicator('updatedAt')}</th>
                <th className="p-2">Дія</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(p => {
                const isEditing = editingId === p._id
                return (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="file"
                          onChange={e => setEditFile(e.target.files[0])}
                          className="border p-1 rounded"
                        />
                      ) : (
                        <img
                          src={p.image || '/images/placeholder.png'}
                          alt={p.name}
                          className="h-8 w-8 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        >
                          {categories.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        p.category
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {isEditing ? (
                        <input
                          name="price"
                          type="number"
                          value={editForm.price}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full text-right"
                        />
                      ) : (
                        `${p.price} ₴`
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {isEditing ? (
                        <input
                          name="minOrder"
                          type="number"
                          min="1"
                          value={editForm.minOrder}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full text-center"
                        />
                      ) : (
                        p.minOrder
                      )}
                    </td>
                    <td className="p-2">
                      {dayjs(p.updatedAt).format('DD.MM.YYYY')}
                    </td>
                    <td className="p-2 text-end space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(p._id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                          >
                            Зберегти
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition"
                          >
                            Відмінити
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(p)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                          >
                            Редагувати
                          </button>
                          <button
                            onClick={() => deleteProduct(p._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                          >
                            Видалити
                          </button>
                        </>
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
