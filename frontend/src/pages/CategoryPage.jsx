// frontend/src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import SearchSort from '../components/SearchSort'
import ProductCard from '../components/ProductCard'
import { categories } from '../constants/categories'

export default function CategoryPage() {
    const { category } = useParams()
    const navigate = useNavigate()
    const { addNotification } = useNotification()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')
    const [page, setPage] = useState(1)
    const limit = 20

    useEffect(() => {
        if (
            category !== 'Усі товари' &&
            !categories.some(c => c.name === category)
        ) {
            addNotification(`Категорія «${category}» не знайдена`)
            navigate('/', { replace: true })
            return
        }

        setLoading(true)
        api
            .get('/products', {
                params: { page, limit, category, search, sort }
            })
            .then(res => setProducts(res.data))
            .catch(() => addNotification('Не вдалося завантажити товари'))
            .finally(() => setLoading(false))
    }, [category, page, search, sort, addNotification, navigate])

    const { data = [], totalPages = 1 } = products

    const contVars = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
    const itemVars = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6 flex-wrap">
                <motion.button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-4 py-2 bg-white shadow rounded-lg border border-gray-200 hover:bg-gray-100 focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg
                        className="w-5 h-5 mr-2 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    <span className="text-gray-700 font-medium">Назад</span>
                </motion.button>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                    {category}
                </h1>
            </div>

            <SearchSort
                search={search}
                onSearch={val => { setSearch(val); setPage(1) }}
                sort={sort}
                onSort={val => { setSort(val); setPage(1) }}
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <motion.div
                        className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                </div>
            ) : (
                <>
                    <motion.div
                        className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        variants={contVars}
                        initial="hidden"
                        animate="visible"
                    >
                        {data.map(p => (
                            <motion.div key={p._id} variants={itemVars}>
                                <ProductCard product={p} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {totalPages > 1 && (
                        <nav className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white border rounded disabled:opacity-50 hover:bg-gray-100"
                            >
                                &laquo; Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1 border rounded hover:bg-gray-100 ${page === i + 1 ? 'bg-green-600 text-white' : 'bg-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 bg-white border rounded disabled:opacity-50 hover:bg-gray-100"
                            >
                                Next &raquo;
                            </button>
                        </nav>
                    )}
                </>
            )}
        </div>
    )
}
