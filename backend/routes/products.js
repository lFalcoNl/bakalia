const router = require('express').Router()
const multer = require('multer')
const upload = multer().single('image')
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const ctrl = require('../controllers/productController')

router.get('/', ctrl.getAll)
router.post('/', auth, roles('admin'), upload, ctrl.create)
router.put('/:id', auth, roles('admin'), upload, ctrl.update)
router.delete('/:id', auth, roles('admin'), ctrl.remove)

module.exports = router
