import React from 'react'

export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 grid-gap mb-4">
      {categories.map(cat => (
        <div
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={
            selected === cat.name
              ? "cursor-pointer p-2 flex flex-col items-center border rounded transition bg-green-600 text-white border-green-800 scale-105"
              : "cursor-pointer p-2 flex flex-col items-center border rounded transition bg-white text-gray-700 hover:bg-gray-100"
          }
        >
          <div className="h-20 w-20 mb-2 bg-gray-200 rounded overflow-hidden">
            {cat.image && <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />}
          </div>
          <span className="text-sm font-medium">{cat.name}</span>
        </div>
      ))}
    </div>
  )
}
