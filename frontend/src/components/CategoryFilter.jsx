// frontend/src/components/CategoryFilter.jsx
import React, { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const MIN_DELAY = 300  // мінімальна тривалість скелетону

function CategoryCard({ category }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const mountTimeRef = useRef(Date.now())
  const to =
    category.name === 'Усі товари'
      ? '/'
      : `/category/${encodeURIComponent(category.name)}`

  const handleLoad = () => {
    const elapsed = Date.now() - mountTimeRef.current
    if (elapsed >= MIN_DELAY) {
      setIsLoaded(true)
    } else {
      setTimeout(() => setIsLoaded(true), MIN_DELAY - elapsed)
    }
  }

  // Щоби обнулити час монтування при кожному ререндері карти
  useEffect(() => {
    mountTimeRef.current = Date.now()
    setIsLoaded(false)
  }, [category.image])

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md
         transition-shadow duration-200 p-4 text-center ${isActive ? 'border-primary ring-2 ring-primary' : ''
        }`
      }
    >
      <div className="w-full aspect-square mb-3 overflow-hidden rounded-md relative bg-gray-100">
        {/* Скелетон: поки isLoaded=false */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={category.image}
          alt={category.name}
          onLoad={handleLoad}
          loading="lazy"
          className={`
            w-full h-full object-cover transform transition-opacity duration-200
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      </div>
      <span className="block text-gray-700 font-medium group-hover:text-gray-900">
        {category.name}
      </span>
    </NavLink>
  )
}

export default function CategoryFilter({ categories }) {
  return (
    <section aria-label="Категорії товарів" className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Категорії</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map(c => (
          <CategoryCard key={c.name} category={c} />
        ))}
      </div>
    </section>
  )
}
