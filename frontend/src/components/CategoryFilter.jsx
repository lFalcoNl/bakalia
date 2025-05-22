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

  // Обнуляємо час монтування при зміні зображення
  useEffect(() => {
    mountTimeRef.current = Date.now()
    setIsLoaded(false)
  }, [category.image])

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        relative group block rounded-xl border bg-white shadow-sm
        transition-transform duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg active:scale-95
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50
        ${isActive ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}
        p-4 text-center
      `}
    >
      <div className="w-full aspect-square overflow-hidden rounded-md relative bg-gray-100">
        {/* Shimmer-скелетон */}
        <div
          className={`
            absolute inset-0 rounded-md
            bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
            bg-[length:200%_100%] animate-shimmer
            ${isLoaded ? 'opacity-0 transition-opacity duration-500' : 'opacity-100'}
          `}
        />

        <img
          src={category.image}
          alt={category.name}
          onLoad={handleLoad}
          loading="lazy"
          className={`
            w-full h-full object-cover
            transform transition-all duration-700 ease-out
            ${isLoaded
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-105 blur-sm'}
          `}
        />

        {/* Легка пульсація на ховер */}
        <div className="
          pointer-events-none
          absolute inset-0 rounded-md
          opacity-0 group-hover:opacity-10
          bg-gradient-to-t from-transparent via-white to-transparent
          animate-pulse-slow
        " />
      </div>

      {/* <span className="
        mt-3 block text-sm font-medium text-gray-800
        transition-colors duration-300
        group-hover:text-primary
      ">
        {category.name}
      </span> */}
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
