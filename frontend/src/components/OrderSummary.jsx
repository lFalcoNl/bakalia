import React from 'react'

export default function OrderSummary({ orders, onClear }) {
  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0)
  return (
    <div className="mb-6 p-6 bg-white border-2 border-secondary shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4 text-primary">Ваші замовлення</h2>
      {orders.map((o, i) => (
        <div key={i} className="flex justify-between py-2">
          <span>{o.name} × {o.quantity}</span>
          <span>{o.total} ₴</span>
        </div>
      ))}
      <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
        <span>Всього</span>
        <span>{grandTotal} ₴</span>
      </div>
      <button onClick={onClear} className="mt-6 px-4 py-2 bg-secondary text-white rounded">
        Очистити все
      </button>
    </div>
  )
}
