require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

const allowed = [
  process.env.FRONTEND_URL,           
  'http://localhost:5173'
]

app.use(cors({
  origin(origin, callback) {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true)
    if (allowed.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error(`Origin ${origin} not allowed`))
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.options('*', cors())

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))

connectDB()

app.get('/api', (_req, res) => res.send('API listening'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/users', require('./routes/users'))

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
