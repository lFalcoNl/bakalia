// frontend/src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import SearchSort from '../components/SearchSort'
import ProductCard from '../components/ProductCard'
import { categories } from '../constants/categories'

export default function CategoryPage() {
    const { category } = useParams()         // назва категорії з URL
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')
    const { addNotification } = useNotification()

    // Завантажуємо всі товари
    useEffect(() => {
        api.get('/products')
            .then(r => setProducts(r.data))
            .catch(() => addNotification('Не вдалося завантаження товарів'))
    }, [addNotification])

    // Фільтрація + пошук + сортування
    const filtered = products
        .filter(p =>
            category === 'Усі товари'
                ? true
                : p.category === category
        )
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        )
    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price)

    // Якщо категорії не існує, редиректіть назад або виведіть 404
    const exists = category === 'Усі товари'
        || categories.some(c => c.name === category)
    if (!exists) {
        return <p>Категорія «{category}» не знайдена</p>
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
                {category}
            </h1>
            <SearchSort
                search={search}
                onSearch={setSearch}
                sort={sort}
                onSort={setSort}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map(p => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>
        </div>
    )
}
