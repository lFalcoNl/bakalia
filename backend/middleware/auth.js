const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
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
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    console.error('Auth middleware: Invalid token', err)
    res.status(403).json({ msg: 'Невірний токен' })
  }
}
