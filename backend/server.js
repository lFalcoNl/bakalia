// backend/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

// CORS: allow your frontend origin (or '*' for testing)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}))

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))

connectDB()

// Health‐check endpoint
app.get('/', (req, res) => {
  res.send('⚡️ API is running')
})

// Mount routes at root rather than /api
app.use('/auth', require('./routes/auth'))
app.use('/products', require('./routes/products'))
app.use('/orders', require('./routes/orders'))
app.use('/users', require('./routes/users'))

// Global error handler
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({ msg: `"${field}" має бути унікальним` })
  }
  console.error(err)
  res.status(500).json({ msg: 'Внутрішня помилка сервера' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
