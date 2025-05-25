const router = require('express').Router()
const { register, login, me } = require('../controllers/authController')
const auth = require('../middleware/auth')

// Публічні
router.post('/register', register)
router.post('/login', login)

// Захищений: перевіряємо токен і наявність користувача
router.get('/me', auth, me)

module.exports = router
