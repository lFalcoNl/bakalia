// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../api/api'
// import { useNotification } from '../context/NotificationContext'
// import { categories } from '../constants/categories'

// export default function NewProductPage() {
//   const [form, setForm] = useState({ name: '', price: '', category: categories[0], code: '', image: '' })
//   const { addNotification } = useNotification()
//   const navigate = useNavigate()

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async e => {
//     e.preventDefault()
//     try {
//       const { data } = await api.post('/products', form)
//       addNotification('Товар додано')
//       navigate('/admin/products')
//     } catch {
//       addNotification('Помилка при додаванні')
//     }
//   }

//   return (
//     <div className="flex justify-center items-center p-4">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
//         <h1 className="text-xl font-bold">Додати новий товар</h1>
//         <input name="name" value={form.name} onChange={handleChange} placeholder="Назва" className="w-full border p-2 rounded" required />
//         <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Ціна" className="w-full border p-2 rounded" required />
//         <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
//           {categories.map(cat => (
//             <option key={cat.name} value={cat.name}>{cat.name}</option>
//           ))}
//         </select>
//         <input name="code" value={form.code} onChange={handleChange} placeholder="Код" className="w-full border p-2 rounded" required />
//         <input name="image" value={form.image} onChange={handleChange} placeholder="URL зображення" className="w-full border p-2 rounded" />
//         <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Додати</button>
//       </form>
//     </div>
//   )
// }
