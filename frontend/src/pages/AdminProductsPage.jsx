import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { categories } from '../constants/categories'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0].name,
    minOrder: 1,
  })
  const [file, setFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { addNotification } = useNotification()

  // Завантажуємо товари
  useEffect(() => {
    api.get('/products')
      .then(r => setProducts(r.data))
      .catch(() => addNotification('Помилка завантаження товарів'))
  }, [])

  // Формуємо новий товар
  const handleAdd = async e => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (file) data.append('image', file)
      const { data: newProd } = await api.post('/products', data)
      setProducts([newProd, ...products])
      setForm({ name: '', price: '', category: categories[0].name, minOrder: 1 })
      setFile(null)
      addNotification('Товар додано')
    } catch {
      addNotification('Помилка при додаванні')
    }
  }

  // Видаляємо товар
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

  // Розпочати редагування
  const startEdit = p => {
    setEditingId(p._id)
    setEditForm({
      name: p.name,
      price: p.price,
      category: p.category,
      minOrder: p.minOrder,
    })
  }
  // Скасувати редагування
  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }
  // Зберегти редагування
  const saveEdit = async id => {
    try {
      const data = new FormData()
      Object.entries(editForm).forEach(([k, v]) => data.append(k, v))
      const { data: updated } = await api.put(`/products/${id}`, data)
      setProducts(products.map(p => (p._id === id ? updated : p)))
      setEditingId(null)
      addNotification('Товар оновлено')
    } catch {
      addNotification('Не вдалося оновити товар')
    }
  }

  // Обробка змін для інлайн-форми
  const handleEditChange = e => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  // Сортування (за потребою лишаємо)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' })
  const requestSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }))
  }
  const getSortIndicator = key =>
    sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''
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
        case 'createdAt':
          A = new Date(a.createdAt).getTime(); B = new Date(b.createdAt).getTime(); break
        default:
          return 0
      }
      return A < B
        ? (sortConfig.direction === 'asc' ? -1 : 1)
        : (A > B ? (sortConfig.direction === 'asc' ? 1 : -1) : 0)
    })
    return arr
  }, [products, sortConfig])

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Управління товарами</h1>

      {/* Форма додавання */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          className="col-span-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Додати товар
        </button>
      </form>

      {/* Таблиця товарів */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Фото</th>
              <th onClick={() => requestSort('name')} className="p-2 cursor-pointer">
                Назва{getSortIndicator('name')}
              </th>
              <th onClick={() => requestSort('category')} className="p-2 cursor-pointer">
                Категорія{getSortIndicator('category')}
              </th>
              <th onClick={() => requestSort('price')} className="p-2 text-right cursor-pointer">
                Ціна{getSortIndicator('price')}
              </th>
              <th onClick={() => requestSort('minOrder')} className="p-2 text-center cursor-pointer">
                Мін. кількість{getSortIndicator('minOrder')}
              </th>
              <th onClick={() => requestSort('createdAt')} className="p-2 cursor-pointer">
                Створено{getSortIndicator('createdAt')}
              </th>
              <th className="p-2">Дія</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map(p => {
              const isEditing = editingId === p._id
              return (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <img
                      src={p.image || '/images/placeholder.png'}
                      alt={p.name}
                      className="h-8 w-8 object-cover rounded"
                    />
                  </td>

                  {/* Назва */}
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

                  {/* Категорія */}
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

                  {/* Ціна */}
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

                  {/* Мін. кількість */}
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

                  {/* Дата */}
                  <td className="p-2">
                    {dayjs(p.createdAt).format('DD.MM.YYYY')}
                  </td>

                  {/* Дія */}
                  <td className="p-2 text-center space-x-2">
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
    </div>
  )
}
