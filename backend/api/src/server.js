// api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// —––––– Whitelist of allowed origins
const allowed = new Set([
  process.env.FRONTEND_URL,     // e.g. "https://bakalia.vercel.app"
  'http://localhost:5173'
]);

// —––––– Debug incoming Origin
app.use((req, _res, next) => {
  console.log('→ Incoming Origin:', req.headers.origin);
  next();
});

// —––––– CORS setup
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowed.has(origin)) return callback(null, true);
    console.error(`Blocked CORS origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// —––––– Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// —––––– Connect to DB
connectDB();

// —––––– Health-check
app.get('/', (_req, res) => res.send('API listening'));

// —––––– API routes (no “/api” prefix here)
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));
app.use('/users', require('./routes/users'));

// —––––– Error handler
app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ msg: `"${field}" має бути унікальним` });
  }
  console.error(err);
  res.status(500).json({ msg: 'Внутрішня помилка сервера' });
});

module.exports = app;
