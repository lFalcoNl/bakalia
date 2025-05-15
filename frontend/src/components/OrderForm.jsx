import { useState } from 'react'
import useAccessTimer from '../hooks/useAccessTimer'
import api from '../api/api'

export default function OrderForm({ product, onSuccess }) {
  const [contact, setContact] = useState('')
  const [quantity, setQuantity] = useState(1)
  const timeLeft = useAccessTimer()

  const submit = async () => {
    await api.post('/orders', {
      products: [{ productId: product._id, quantity }],
      contact
    })
    onSuccess()
  }

  if (timeLeft === 0) return <p>Ваш пробний період закінчився.</p>

  return (
    <div className="space-y-2">
      <input
        type="number"
        value={quantity}
        min="1"
        onChange={e => setQuantity(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        value={contact}
        onChange={e => setContact(e.target.value)}
        placeholder="Контактні дані"
        className="border p-2 rounded w-full"
      />
      <button onClick={submit} className="btn w-full">Підтвердити замовлення</button>
    </div>
  )
}
