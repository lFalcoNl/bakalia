// frontend/src/pages/PrintPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function PrintPage() {
    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({
        key: 'category',
        direction: 'ascending'
    })

    // Налаштування розміру тексту
    const sizeOptions = ['text-xs', 'text-sm', 'text-base', 'text-lg']
    const [sizeIndex, setSizeIndex] = useState(1) // 'text-sm' за замовчуванням
    const textSizeClass = sizeOptions[sizeIndex]
    const decreaseSize = () => sizeIndex > 0 && setSizeIndex(i => i - 1)
    const increaseSize = () =>
        sizeIndex < sizeOptions.length - 1 && setSizeIndex(i => i + 1)

    useEffect(() => {
        api
            .get('/products')
            .then(({ data }) => setProducts(data))
            .catch(console.error)
    }, [])

    // Сортування
    const sortedProducts = useMemo(() => {
        const arr = [...products]
        arr.sort((a, b) => {
            let aKey = a[sortConfig.key]
            let bKey = b[sortConfig.key]
            if (sortConfig.key === 'price' || sortConfig.key === 'minOrder') {
                aKey = aKey ?? 0; bKey = bKey ?? 0
                return sortConfig.direction === 'ascending'
                    ? aKey - bKey
                    : bKey - aKey
            }
            return sortConfig.direction === 'ascending'
                ? String(aKey).localeCompare(String(bKey))
                : String(bKey).localeCompare(String(aKey))
        })
        return arr
    }, [products, sortConfig])

    // Фільтрація
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return sortedProducts
        const term = searchTerm.toLowerCase()
        return sortedProducts.filter(
            p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
        )
    }, [sortedProducts, searchTerm])

    const getSortIndicator = key =>
        sortConfig.key === key
            ? sortConfig.direction === 'ascending'
                ? ' ▲'
                : ' ▼'
            : ''

    const requestSort = key =>
        setSortConfig(prev =>
            prev.key === key
                ? {
                    key,
                    direction:
                        prev.direction === 'ascending' ? 'descending' : 'ascending'
                }
                : { key, direction: 'ascending' }
        )

    return (
        <div className="print-page p-4">
            {/* Налаштування та пошук — не видно в друці */}
            <div className="print:hidden flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ← Назад
                </button>
                <input
                    type="text"
                    placeholder="Пошук за назвою або категорією…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border p-2 rounded w-full md:w-1/3"
                />
                <div className="flex items-center space-x-2">
                    <button
                        onClick={decreaseSize}
                        disabled={sizeIndex === 0}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        A-
                    </button>
                    <button
                        onClick={increaseSize}
                        disabled={sizeIndex === sizeOptions.length - 1}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        A+
                    </button>
                </div>
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    🖨 Друкувати
                </button>
            </div>

            {/* Таблиця з динамічним розміром тексту */}
            <div className="overflow-x-auto">
                <table
                    className={`min-w-full table-auto border border-gray-300 ${textSizeClass}`}
                >
                    <thead>
                        <tr className="bg-gray-100">
                            <th
                                className="border p-2 text-left cursor-pointer"
                                onClick={() => requestSort('name')}
                            >
                                Назва{getSortIndicator('name')}
                            </th>
                            <th
                                className="border p-2 text-left cursor-pointer"
                                onClick={() => requestSort('price')}
                            >
                                Ціна{getSortIndicator('price')}
                            </th>
                            <th
                                className="border p-2 text-left cursor-pointer"
                                onClick={() => requestSort('category')}
                            >
                                Категорія{getSortIndicator('category')}
                            </th>
                            <th
                                className="border p-2 text-left cursor-pointer"
                                onClick={() => requestSort('minOrder')}
                            >
                                Мін. кількість{getSortIndicator('minOrder')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p._id} className="even:bg-gray-50">
                                <td className="border p-2">{p.name}</td>
                                <td className="border p-2">{p.price} ₴</td>
                                <td className="border p-2">{p.category}</td>
                                <td className="border p-2">{p.minOrder}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
