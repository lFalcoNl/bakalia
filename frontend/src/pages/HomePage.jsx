// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'
import api from '../api/api'
import CategoryFilter from '../components/CategoryFilter'
import { categories } from '../constants/categories'

export default function HomePage() {


  useEffect(() => {
    api
      .get('/products')
      .then(r => setProducts(r.data))
      .catch(err => console.error('Помилка завантаження товарів', err))
  }, [])

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6 flex flex-col">
      <CategoryFilter
        categories={[
          ...categories
        ]}
      />
    </div>
  )
}
