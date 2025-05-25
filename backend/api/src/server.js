// api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Whitelist
const allowed = new Set([
  process.env.FRONTEND_URL,    // e.g. "https://bakalia.vercel.app"
  'http://localhost:5173'
]);

// Debug
app.use((req, _res, next) => {
  console.log('→ Origin:', req.headers.origin);
  next();
});

// CORS options
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowed.has(origin)) return cb(null, true);
    console.error(`Blocked CORS origin: ${origin}`);
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS to all requests **and** to preflight
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // <— use the same corsOptions here

// Body parsing & DB
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
connectDB();

// Health-check
app.get('/', (_req, res) => res.send('API listening'));

// Your routes (with /api prefix if you want)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Error handler
app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ msg: `"${field}" must be unique` });
  }
  console.error(err);
  res.status(500).json({ msg: 'Internal server error' });
});

module.exports = app;
