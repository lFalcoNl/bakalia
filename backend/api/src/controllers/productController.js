// backend/api/src/controllers/productController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const Busboy = require('busboy');

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('productController.getAll error:', err);
    res.status(500).json({ msg: 'Помилка отримання товарів' });
  }
};

// Shared handler for CREATE & UPDATE
async function handleUpsert(req, res, isUpdate = false) {
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');
  let fields = {};
  let uploadPromise = null;

  if (!isMultipart) {
    // JSON body (no file)
    fields = req.body;
  } else {
    // multipart/form-data → parse with Busboy
    const bb = Busboy({ headers: req.headers });
    bb.on('field', (name, val) => {
      fields[name] = val;
    });
    bb.on('file', (name, fileStream) => {
      if (name === 'image') {
        const publicId = isUpdate
          ? req.params.id
          : `${Date.now().toString()} - ${fields.name}`;
        uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'products',
              public_id: publicId,
              resource_type: 'image'
            },
            (error, result) => {
              if (error) return reject(error);
              // resolve with the full URL
              resolve(result.secure_url);
            }
          );
          fileStream.pipe(uploadStream);
        });
      } else {
        fileStream.resume(); // skip other files
      }
    });

    // wait for Busboy to finish parsing
    req.pipe(bb);
    await new Promise(resolve => bb.on('finish', resolve));

    if (uploadPromise) {
      // get the secure_url string
      fields.image = await uploadPromise;
    }
  }

  try {
    // Build the product data
    const data = {
      name: fields.name,
      price: Number(fields.price),
      category: fields.category,
      minOrder: Number(fields.minOrder)
    };
    if (fields.image) {
      data.image = fields.image; // full Cloudinary URL
    }

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

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ msg: 'Товар не знайдено' });
    }

    // delete image from Cloudinary if set
    if (prod.image) {
      // extract public_id from secure_url
      const parts = prod.image.split('/');
      const filename = parts.pop();               // "1623456789012.jpg"
      const folder = parts.pop();               // "products"
      const publicId = `${folder}/${filename.split('.').shift()}`;
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image'
      });
    }

    // remove product references from orders
    await Order.updateMany(
      { 'products.productId': prod._id },
      { $pull: { products: { productId: prod._id } } }
    );
    await Order.deleteMany({ products: { $size: 0 } });

    // delete the product document
    await prod.deleteOne();
    res.json({ msg: 'Товар і зображення видалені' });
  } catch (err) {
    console.error('productController.remove error:', err);
    res.status(500).json({ msg: 'Помилка видалення товару' });
  }
};
