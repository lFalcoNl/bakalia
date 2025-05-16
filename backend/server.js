require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

// CORS має бути ПЕРЕД роутами
app.use(cors({
  origin: ['http://localhost:5173', 'https://bakalia-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.options('*', cors()) // Preflight запити

// Body parser
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))

// DB
connectDB()

// Health check
app.get('/', (req, res) => {
  res.send('works')
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/users', require('./routes/users'))

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({ msg: `"${field}" має бути унікальним` })
  }
  console.error(err)
  res.status(500).json({ msg: 'Внутрішня помилка сервера' })
})

// Start
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on ${PORT}`))
