// frontend/src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminProducts from './pages/AdminProductsPage'
import AdminOrders from './pages/AdminOrdersPage'
import AdminUsers from './pages/AdminUsersPage'
import PrintPage from './pages/PrintPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />

      <main className="flex-grow w-full max-w-[1300px] mx-auto px-4 py-6 bg-white rounded-lg shadow-sm">
        <Routes>
          {/* публічні */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* всі інші — тільки для залогінених */}
          <Route element={<PrivateRoute />}>
            {/* користувацькі */}
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* адмінські */}
            <Route element={<PrivateRoute adminOnly />}>
              <Route path="/admin/print" element={<PrintPage />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* всі інші шляхи → на реєстрацію */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
