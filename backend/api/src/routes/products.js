// backend/api/src/routes/products.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getAll);
router.post('/', auth, roles('admin'), ctrl.create);
router.put('/:id', auth, roles('admin'), ctrl.update);
router.delete('/:id', auth, roles('admin'), ctrl.remove);

module.exports = router;