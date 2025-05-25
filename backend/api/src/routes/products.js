// backend/api/src/routes/products.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/productController');

// Public: list products
router.get('/', ctrl.getAll);

// Admin: create product with optional image upload
router.post(
    '/',
    auth,
    roles('admin'),
    ctrl.create
);

// Admin: update product and image
router.put(
    '/:id',
    auth,
    roles('admin'),
    ctrl.update
);

// Admin: delete product and its image
router.delete(
    '/:id',
    auth,
    roles('admin'),
    ctrl.remove
);

module.exports = router;