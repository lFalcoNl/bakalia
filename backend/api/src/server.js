// api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// —––––– Whitelist of allowed origins
const allowed = new Set([
  process.env.FRONTEND_URL,
  'http://localhost:5173'
]);

// —––––– Debug incoming Origin
app.use((req, _res, next) => {
  console.log('→ Incoming Origin:', req.headers.origin);
  next();
});

// —––––– CORS setup
const corsOptions = {
  origin(origin, callback) {
    // 1) allow requests with no origin (curl, mobile apps, etc.)
    if (!origin) return callback(null, true);

    // 2) allow if whitelisted exactly
    if (allowed.has(origin)) {
      return callback(null, true);
    }

    // 3) reject!
    console.error(`Blocked CORS origin: ${origin}`);
    return callback(null, false);
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// —––––– Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// —––––– Connect to DB
connectDB();

// —––––– Routes
app.get('/', (_req, res) => res.send('works'));
app.get('/api', (_req, res) => res.send('API listening'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// —––––– Error handler
app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ msg: `"${field}" має бути унікальним` });
  }
  console.error(err);
  res.status(500).json({ msg: 'Внутрішня помилка сервера' });
});

// No app.listen — this file is wrapped by serverless-http in your index.js
module.exports = app;
