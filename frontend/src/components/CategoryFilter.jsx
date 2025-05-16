// frontend/src/components/CategoryFilter.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'

export default function CategoryFilter({ categories }) {
  return (
    <section aria-label="Категорії товарів" className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Категорії</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((c) => {
          const to =
            c.name === 'Усі товари'
              ? '/'
              : `/category/${encodeURIComponent(c.name)}`
          return (
            <NavLink
              key={c.name}
              to={to}
              className={({ isActive }) =>
                `group block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 text-center ${isActive ? 'border-primary ring-2 ring-primary' : ''
                }`
              }
            >
              <div className="w-full aspect-square mb-3 overflow-hidden rounded-md">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover transform transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <span className="block text-gray-700 font-medium group-hover:text-gray-900">
                {c.name}
              </span>
            </NavLink>
          )
        })}
      </div>
    </section>
  )
}
