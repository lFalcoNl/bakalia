import React from 'react'
import CategoryCard from './CategoryCard'

export default function CategoryFilter({ categories }) {
  return (
    <section aria-label="Категорії товарів" className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Категорії
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map(c => (
          <CategoryCard key={c.slug} category={c} />
        ))}
      </div>
    </section>
  )
}
