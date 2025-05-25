// backend/api/src/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const { Busboy } = require('busboy');

// GET all products
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('productController.getAll error:', err);
    res.status(500).json({ msg: 'Помилка отримання товарів' });
  }
};

// CREATE / UPDATE helper
async function handleUpsert(req, res, isUpdate) {
  const bb = new Busboy({ headers: req.headers });
  const fields = {};
  let imagePromise = null;

  bb.on('field', (name, val) => {
    fields[name] = val;
  });

  bb.on('file', (name, fileStream) => {
    if (name === 'image') {
      const publicId = isUpdate ? req.params.id : Date.now().toString();
      imagePromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'products',
            public_id: publicId,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        fileStream.pipe(uploadStream);
      });
    } else {
      // ignore other files
      fileStream.resume();
    }
  });

  // Pipe the request into Busboy, then wait for it to finish
  req.pipe(bb);
  await new Promise(resolve => bb.on('finish', resolve));

  try {
    // If an image was uploaded, wait for its URL
    if (imagePromise) {
      fields.image = await imagePromise;
    }

    // Build the data object
    const data = {
      name: fields.name,
      price: Number(fields.price),
      category: fields.category,
      minOrder: Number(fields.minOrder)
    };
    if (fields.image) data.image = fields.image;

    let product;
    if (isUpdate) {
      product = await Product.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      );
      if (!product) {
        return res.status(404).json({ msg: 'Товар не знайдено' });
      }
      return res.json(product);
    } else {
      product = await new Product(data).save();
      return res.status(201).json(product);
    }
  } catch (err) {
    console.error(`productController.${isUpdate ? 'update' : 'create'} error:`, err);
    return res
      .status(500)
      .json({ msg: isUpdate ? 'Помилка оновлення товару' : 'Помилка створення товару' });
  }
}

exports.create = (req, res) => handleUpsert(req, res, false);
exports.update = (req, res) => handleUpsert(req, res, true);

// DELETE a product, its Cloudinary image, and clean up orders
exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ msg: 'Товар не знайдено' });
    }

    // Remove image from Cloudinary if set
    if (prod.image) {
      const parts = prod.image.split('/');
      const filename = parts.pop();           // e.g. "1623456789012.jpg"
      const folder = parts.pop();           // should be "products"
      const publicId = `${folder}/${filename.split('.').shift()}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }

    // Clean up any orders referencing this product
    await Order.updateMany(
      { 'products.productId': prod._id },
      { $pull: { products: { productId: prod._id } } }
    );
    await Order.deleteMany({ products: { $size: 0 } });

    // Finally, delete the product document
    await prod.deleteOne();
    res.json({ msg: 'Товар і зображення видалені' });
  } catch (err) {
    console.error('productController.remove error:', err);
    res.status(500).json({ msg: 'Помилка видалення товару' });
  }
};
