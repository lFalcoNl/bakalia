import React, { useState } from 'react'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'

export default function ProductModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', price: '', category: '', code: '' })
  const [file, setFile] = useState(null)
  const { addNotification } = useNotification()

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const data = new FormData()
    Object.entries(form).forEach(([k, v]) => data.append(k, v))
    if (file) data.append('image', file)

    try {
      const res = await api.post('/products', data)
      onSuccess(res.data)
      addNotification('Товар додано')
      onClose()
    } catch {
      addNotification('Помилка при додаванні')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-3">
        <h2 className="text-lg font-bold mb-2">Додати товар</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Назва" className="w-full border p-2 rounded" required />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Ціна" className="w-full border p-2 rounded" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Категорія" className="w-full border p-2 rounded" required />
        <input name="code" value={form.code} onChange={handleChange} placeholder="Код" className="w-full border p-2 rounded" required />
        <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full" />
        <div className="flex justify-between mt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Зберегти</button>
          <button onClick={onClose} type="button" className="bg-gray-300 px-4 py-2 rounded">Скасувати</button>
        </div>
      </form>
    </div>
  )
}
