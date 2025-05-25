// backend/api/src/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const Busboy = require('busboy');

// Helper: returns a Cloudinary upload stream
function getUploadStream(publicId) {
  return cloudinary.uploader.upload_stream(
    { folder: 'products', public_id: publicId },
    (error, result) => {
      if (error) throw error;
      return result;
    }
  );
}

// Shared handler for create and update
async function handleProductUpsert(req, res, isUpdate = false) {
  try {
    let fields = {};
    let imagePromise = null;

    // If JSON request (no file)
    if (!req.is('multipart/form-data')) {
      fields = req.body;
    } else {
      // Parse multipart form-data with Busboy
      const bb = Busboy({ headers: req.headers });
      bb.on('field', (name, val) => { fields[name] = val; });
      bb.on('file', (name, stream) => {
        if (name === 'image') {
          const publicId = isUpdate ? req.params.id : Date.now().toString();
          const uploadStream = getUploadStream(publicId);
          stream.pipe(uploadStream);
          imagePromise = new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
          });
        } else stream.resume();
      });

      await new Promise((resolve) => {
        bb.on('finish', resolve);
        req.pipe(bb);
      });

      if (imagePromise) {
        await imagePromise;
        fields.image = isUpdate
          ? `products/${req.params.id}`
          : `products/${Date.now()}`;
      }
    }

    const data = {
      name: fields.name,
      price: Number(fields.price),
      category: fields.category,
      minOrder: Number(fields.minOrder)
    };
    if (fields.image) data.image = fields.image;

    let prod;
    if (isUpdate) {
      prod = await Product.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      );
      if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });
    } else {
      prod = await new Product(data).save();
      res.status(201).json(prod);
      return;
    }

    res.json(prod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: isUpdate ? 'Помилка оновлення товару' : 'Помилка створення товару' });
  }
}

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const docs = await Product.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Помилка отримання товарів' });
  }
};

// CREATE /api/products
exports.create = (req, res) => handleProductUpsert(req, res, false);

// UPDATE /api/products/:id
exports.update = (req, res) => handleProductUpsert(req, res, true);

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });

    // Remove image from Cloudinary if exists
    if (prod.image) {
      await cloudinary.uploader.destroy(prod.image, { resource_type: 'image' });
    }

    // Cleanup orders
    await Order.updateMany(
      { 'products.productId': prod._id },
      { $pull: { products: { productId: prod._id } } }
    );
    await Order.deleteMany({ products: { $size: 0 } });

    await prod.remove();
    res.json({ msg: 'Товар і зображення видалені' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Помилка видалення товару' });
  }
};