// frontend/src/pages/HomePage.jsx
import React from 'react'
import CategoryFilter from '../components/CategoryFilter'
import { categories } from '../constants/categories'

export default function HomePage() {
  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6 flex flex-col">
      <CategoryFilter categories={categories} />
    </div>
  )
}
