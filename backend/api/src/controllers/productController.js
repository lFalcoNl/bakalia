// backend/api/src/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const Busboy = require('busboy');

// Helper: returns a Cloudinary upload stream
function getUploadStream(publicId) {
  return cloudinary.uploader.upload_stream(
    { folder: 'products', public_id: publicId, resource_type: 'image' },
    (error, result) => {
      if (error) throw error;
      return result;
    }
  );
}

// Unified handler for both create and update operations
async function handleProductUpsert(req, res, isUpdate = false) {
  try {
    let fields = {};
    let imagePromise = null;
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (!isMultipart) {
      // JSON body: only scalar fields
      const { name, price, category, minOrder } = req.body;
      fields = { name, price, category, minOrder };
    } else {
      // multipart/form-data: parse with Busboy
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
        } else {
          stream.resume();
        }
      });

      await new Promise(resolve => {
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

    // Build data payload
    const data = {
      name: fields.name,
      price: Number(fields.price),
      category: fields.category,
      minOrder: Number(fields.minOrder)
    };
    if (fields.image && typeof fields.image === 'string') {
      data.image = fields.image;
    }

    let prod;
    if (isUpdate) {
      prod = await Product.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      );
      if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });
      return res.json(prod);
    } else {
      prod = await new Product(data).save();
      return res.status(201).json(prod);
    }
  } catch (err) {
    console.error(err);
    const msg = isUpdate ? 'Помилка оновлення товару' : 'Помилка створення товару';
    return res.status(500).json({ msg });
  }
}

// Controller methods
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Помилка отримання товарів' });
  }
};

exports.create = (req, res) => handleProductUpsert(req, res, false);
exports.update = (req, res) => handleProductUpsert(req, res, true);

exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });

    // Delete image from Cloudinary
    if (prod.image) {
      await cloudinary.uploader.destroy(prod.image, { resource_type: 'image' });
    }

    // Clean up orders
    await Order.updateMany(
      { 'products.productId': prod._id },
      { $pull: { products: { productId: prod._id } } }
    );
    await Order.deleteMany({ products: { $size: 0 } });

    await prod.deleteOne();
    res.json({ msg: 'Товар і зображення видалені' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Помилка видалення товару' });
  }
};