import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import { categories } from '../constants/categories'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0].name,
    code: '',
  })
  const [file, setFile] = useState(null)
  const { addNotification } = useNotification()

  // сортування
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending',
  })
  const requestSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? {
          key,
          direction:
            prev.direction === 'ascending' ? 'descending' : 'ascending',
        }
        : { key, direction: 'ascending' }
    )
  }
  const getSortIndicator = key =>
    sortConfig.key === key
      ? sortConfig.direction === 'ascending'
        ? ' ▲'
        : ' ▼'
      : ''

  // завантажуємо товари
  useEffect(() => {
    api
      .get('/products')
      .then(r => setProducts(r.data))
      .catch(err => {
        console.error(err)
        addNotification('Помилка завантаження товарів')
      })
  }, [])

  // відсортований список
  const sortedProducts = useMemo(() => {
    const arr = [...products]
    arr.sort((a, b) => {
      let aKey = a[sortConfig.key]
      let bKey = b[sortConfig.key]
      // якщо сортуємо по price — числове порівняння
      if (sortConfig.key === 'price') {
        aKey = Number(aKey)
        bKey = Number(bKey)
      } else {
        aKey = aKey.toString().toLowerCase()
        bKey = bKey.toString().toLowerCase()
      }
      if (aKey < bKey) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aKey > bKey) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
    return arr
  }, [products, sortConfig])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleFile = e => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const data = new FormData()
    data.append('name', form.name)
    data.append('price', form.price)
    data.append('category', form.category)
    data.append('code', form.code)
    if (file) data.append('image', file)

    try {
      const { data: prod } = await api.post('/products', data)
      setProducts(prev => [prod, ...prev])
      setForm({
        name: '',
        price: '',
        category: categories[0].name,
        code: '',
      })
      setFile(null)
      addNotification('Товар додано')
    } catch (err) {
      console.error(err)
      addNotification('Помилка при додаванні')
    }
  }

  const deleteProduct = async id => {
    if (!window.confirm('Видалити товар?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
      addNotification('Товар видалено')
    } catch {
      addNotification('Не вдалося видалити товар')
    }
  }

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Управління товарами</h1>

      {/* Форма додавання */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Назва"
          className="border p-2 rounded text-sm w-full"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Ціна"
          className="border p-2 rounded text-sm w-full"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded text-sm w-full"
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
          className="border p-2 rounded text-sm w-full"
          required
        />
        <input
          type="file"
          onChange={handleFile}
          className="border p-2 rounded text-sm w-full"
        />
        <button
          type="submit"
          className="sm:col-span-2 md:col-span-3 bg-green-600 text-white rounded py-2 text-sm hover:bg-green-700"
        >
          Додати товар
        </button>
      </form>

      {/* Таблиця / картки */}
      <div className="overflow-x-auto">
        <table className="table-fixed w-full border border-gray-200 bg-white text-sm md:table">
          <thead className="hidden md:table-header-group bg-gray-100">
            <tr>
              <th
                className="cursor-pointer px-4 py-2 w-2/5 text-left"
                onClick={() => requestSort('name')}
              >
                Назва{getSortIndicator('name')}
              </th>
              <th
                className="cursor-pointer px-4 py-2 w-2/5 text-left"
                onClick={() => requestSort('category')}
              >
                Категорія{getSortIndicator('category')}
              </th>
              <th
                className="cursor-pointer px-4 py-2 w-1/5 text-right"
                onClick={() => requestSort('price')}
              >
                Ціна{getSortIndicator('price')}
              </th>
              <th className="px-4 py-2 w-1/5 text-center">Дія</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {sortedProducts.map(p => (
              <tr
                key={p._id}
                className="block md:table-row mb-4 md:mb-0 bg-white md:bg-transparent border md:border-0 md:border-t"
              >
                {/* Назва */}
                <td className="block md:table-cell px-4 py-2 whitespace-nowrap">
                  <span className="font-semibold md:hidden">Назва: </span>
                  {p.name}
                </td>
                {/* Категорія */}
                <td className="block md:table-cell px-4 py-2 whitespace-nowrap">
                  <span className="font-semibold md:hidden">Категорія: </span>
                  {p.category}
                </td>
                {/* Ціна */}
                <td className="block md:table-cell px-4 py-2 text-right">
                  <span className="font-semibold md:hidden">Ціна: </span>
                  {p.price} ₴
                </td>
                {/* Дія */}
                <td className="block md:table-cell px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
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
