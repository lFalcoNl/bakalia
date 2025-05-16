// frontend/src/pages/AdminProductsPage.jsx
import React, { useState, useEffect } from 'react'
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
    code: '',
    minOrder: 1,
  })
  const [file, setFile] = useState(null)
  const { addNotification } = useNotification()

  useEffect(() => {
    api.get('/products')
      .then(r => setProducts(r.data))
      .catch(() => addNotification('Помилка завантаження товарів'))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  const handleFile = e => setFile(e.target.files[0])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (file) data.append('image', file)
      const { data: newProd } = await api.post('/products', data)
      setProducts([newProd, ...products])
      setForm({
        name: '',
        price: '',
        category: categories[0].name,
        code: '',
        minOrder: 1,
      })
      setFile(null)
      addNotification('Товар додано')
    } catch {
      addNotification('Помилка при додаванні')
    }
  }

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

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Управління товарами</h1>

      {/* Форма додавання */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Назва"
          className="border p-2 rounded"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Ціна"
          className="border p-2 rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          {categories.map(c => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Код"
          className="border p-2 rounded"
          required
        />
        <input
          name="minOrder"
          type="number"
          min="1"
          value={form.minOrder}
          onChange={handleChange}
          placeholder="Мін. кількість"
          className="border p-2 rounded"
          required
        />
        <input
          type="file"
          onChange={handleFile}
          className="border p-2 rounded"
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
              <th className="p-2">ID</th>
              <th className="p-2">Назва</th>
              <th className="p-2">Код</th>
              <th className="p-2">Категорія</th>
              <th className="p-2">Ціна</th>
              <th className="p-2">MinOrder</th>
              <th className="p-2">Створено</th>
              <th className="p-2">Дія</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <img
                    src={p.image || '/images/placeholder.png'}
                    alt={p.name}
                    className="h-8 w-8 object-cover rounded"
                  />
                </td>
                <td className="p-2 break-all">{p._id}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.code}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2 text-right">{p.price} ₴</td>
                <td className="p-2 text-center">{p.minOrder}</td>
                <td className="p-2">
                  {dayjs(p.createdAt).format('DD.MM.YYYY')}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
