import React, { useState, useEffect } from 'react'
import api from '../api/api'
import ProductCard from '../components/ProductCard'
import ReceiptModal from '../components/ReceiptModal'
import CategoryFilter from '../components/CategoryFilter'
import SearchSort from '../components/SearchSort'
import { categories } from '../constants/categories'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  // Встановлюємо «Усі товари» за замовчуванням, щоб спочатку показувати весь каталог
  const [cat, setCat] = useState('Усі товари')
  const [receipts, setReceipts] = useState([])

  useEffect(() => {
    api
      .get('/products')
      .then(r => setProducts(r.data))
      .catch(err => console.error('Помилка завантаження товарів', err))
  }, [])

  // Фільтрація за категорією та пошуком
  let filtered = products
    .filter(p => cat === 'Усі товари' || p.category === cat)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  // Сортування за ціною
  if (sort === 'price_asc') {
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    filtered = [...filtered].sort((a, b) => b.price - a.price)
  }

  const addReceipt = receipt => {
    setReceipts(prev => [...prev, receipt])
  }

  const closeModal = () => {
    setReceipts([])
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6 flex flex-col">
      {/* Фільтр категорій */}
      <CategoryFilter
        categories={[{ name: 'Усі товари', image: '/images/categories/all.jpg' }, ...categories]}
        selected={cat}
        onSelect={setCat}
      />

      {/* Пошук та сортування */}
      <SearchSort
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
      />

      {/* Сітка товарів */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-grow">
        {filtered.map(p => (
          <ProductCard key={p._id} product={p} onOrder={addReceipt} />
        ))}
      </div>

      {/* Модалка підтвердження замовлення */}
      {receipts.length > 0 && (
        <ReceiptModal receipts={receipts} onClose={closeModal} />
      )}
    </div>
  )
}
