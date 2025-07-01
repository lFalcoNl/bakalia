const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader) {
    console.error('Auth middleware: No Authorization header')
    return res.status(401).json({ msg: 'Немає токена' })
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    console.error('Auth middleware: Invalid auth header format')
    return res.status(401).json({ msg: 'Невірний формат токена' })
  }

  try {
    // 1) Розбираємо та валідуємо JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 2) Шукаємо користувача в БД — якщо його видалили, токен стає недійсним
    const user = await User.findById(decoded.id)
    if (!user) {
      console.error('Auth middleware: User not found')
      return res.status(401).json({ msg: 'Токен більше не дійсний' })
    }

    // 3) Підставляємо повний об’єкт user у req
    req.user = user
    next()
  } catch (err) {
    console.error('Auth middleware: Invalid token', err)
    return res.status(401).json({ msg: 'Невірний або прострочений токен' })
  }
}
