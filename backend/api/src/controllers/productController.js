// backend/api/src/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary.js');
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
exports.create = async (req, res) => {
  try {
    const fields = {};
    let imagePromise = null;

    const bb = Busboy({ headers: req.headers });
    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('file', (name, stream) => {
      if (name === 'image') {
        const publicId = Date.now().toString();
        const uploadStream = getUploadStream(publicId);
        stream.pipe(uploadStream);
        imagePromise = new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });
      } else stream.resume();
    });

    bb.on('finish', async () => {
      if (imagePromise) {
        await imagePromise;
        fields.image = `products/${Date.now()}`;
      }
      const prod = await new Product({
        name: fields.name,
        price: Number(fields.price),
        category: fields.category,
        minOrder: Number(fields.minOrder),
        image: fields.image
      }).save();
      res.status(201).json(prod);
    });

    req.pipe(bb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Помилка створення товару' });
  }
};

// UPDATE /api/products/:id
exports.update = async (req, res) => {
  try {
    const fields = {};
    let imagePromise = null;

    const bb = Busboy({ headers: req.headers });
    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('file', (name, stream) => {
      if (name === 'image') {
        const publicId = req.params.id;
        const uploadStream = getUploadStream(publicId);
        stream.pipe(uploadStream);
        imagePromise = new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });
      } else stream.resume();
    });

    bb.on('finish', async () => {
      if (imagePromise) {
        await imagePromise;
        fields.image = `products/${req.params.id}`;
      }
      const prod = await Product.findByIdAndUpdate(
        req.params.id,
        { ...fields, price: Number(fields.price), minOrder: Number(fields.minOrder) },
        { new: true, runValidators: true }
      );
      if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });
      res.json(prod);
    });

    req.pipe(bb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Помилка оновлення товару' });
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });

    // Remove image from Cloudinary
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