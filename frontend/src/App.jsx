import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminUsersPage from './pages/AdminUsersPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />

      <main className="flex-grow w-full max-w-[1300px] mx-auto px-4 py-6 bg-white rounded-lg shadow-sm">
        <Routes>
          {/* Публічні */}
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Адмінські */}
          <Route
            path="/admin/products"
            element={
              <PrivateRoute adminOnly>
                <AdminProductsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute adminOnly>
                <AdminOrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <AdminUsersPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
