// backend/api/src/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');

// Fix Busboy import so we always get the constructor
const bbModule = require('busboy');
const Busboy = bbModule.Busboy || bbModule;

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
  // Instantiate Busboy properly
  const bb = Busboy({ headers: req.headers });
  const fields = {};
  let imagePromise = null;

  bb.on('field', (name, val) => {
    fields[name] = val;
  });

  bb.on('file', (name, fileStream) => {
    if (name === 'image') {
      const publicId = isUpdate
        ? req.params.id
        : Date.now().toString();

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
      fileStream.resume();
    }
  });

  // Pipe the request into Busboy and await finish
  req.pipe(bb);
  await new Promise(resolve => bb.on('finish', resolve));

  try {
    // Wait for the image upload if one was attached
    if (imagePromise) {
      fields.image = await imagePromise;
    }

    // Build up the data payload
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

// DELETE a product + its image + clean up orders
exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ msg: 'Товар не знайдено' });
    }

    if (prod.image) {
      // derive public_id from secure_url
      const parts = prod.image.split('/');
      const filename = parts.pop();  // e.g. "1623456789012.jpg"
      const folder = parts.pop();  // should be "products"
      const publicId = `${folder}/${filename.split('.').shift()}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }

    // clean up orders
    await Order.updateMany(
      { 'products.productId': prod._id },
      { $pull: { products: { productId: prod._id } } }
    );
    await Order.deleteMany({ products: { $size: 0 } });

    // delete the product
    await prod.deleteOne();
    res.json({ msg: 'Товар і зображення видалені' });
  } catch (err) {
    console.error('productController.remove error:', err);
    res.status(500).json({ msg: 'Помилка видалення товару' });
  }
};
