const router = require('express').Router()
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const ctrl = require('../controllers/orderController')

router.get('/', auth, roles('admin'), ctrl.getAll)
router.post('/', auth, ctrl.create)
router.patch('/:id', auth, roles('admin'), ctrl.updateStatus)
router.delete('/:id', auth, roles('admin'), ctrl.remove)

module.exports = router
