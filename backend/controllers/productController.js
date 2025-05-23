const Product = require('../models/Product');
const Order = require('../models/Order');

// Збираємо imageData + imageType в data URL
function toDataUrl({ imageData, imageType }) {
  if (!imageData || !imageType) return null;
  return `data:${imageType};base64,${imageData}`;
}

exports.getAll = async (req, res) => {
  try {
    // Use an aggregation with allowDiskUse to avoid in-memory sort limits
    const docs = await Product.aggregate(
      [
        { $sort: { createdAt: -1 } },
        {
          $project: {
            name: 1,
            price: 1,
            category: 1,
            minOrder: 1,
            createdAt: 1,
            updatedAt: 1,       // include updatedAt
            imageData: 1,
            imageType: 1
          }
        }
      ],
      { allowDiskUse: true }
    );

    const result = docs.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      minOrder: p.minOrder,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,     // return updatedAt
      image: toDataUrl(p)
    }));

    res.json(result);
  } catch (err) {
    console.error('productController.getAll error:', err);
    res.status(500).json({ msg: 'Помилка отримання товарів' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, category, minOrder } = req.body;
    const data = {
      name,
      price: Number(price),
      category,
      minOrder: Number(minOrder),
    };
    if (req.file) {
      data.imageData = req.file.buffer.toString('base64');
      data.imageType = req.file.mimetype;
    }
    const prod = await new Product(data).save();
    res.status(201).json({
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      minOrder: prod.minOrder,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,   // include updatedAt
      image: toDataUrl(prod)
    });
  } catch (err) {
    console.error('productController.create error:', err);
    res.status(500).json({ msg: 'Помилка створення товару' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, category, minOrder } = req.body;
    const data = {
      name,
      price: Number(price),
      category,
      minOrder: Number(minOrder),
    };
    if (req.file) {
      data.imageData = req.file.buffer.toString('base64');
      data.imageType = req.file.mimetype;
    }
    const prod = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });

    res.json({
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      minOrder: prod.minOrder,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,   // include updatedAt
      image: toDataUrl(prod)
    });
  } catch (err) {
    console.error('productController.update error:', err);
    res.status(500).json({ msg: 'Помилка оновлення товару' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ msg: 'Товар не знайдено' });

    await Order.updateMany(
      { 'products.productId': id },
      { $pull: { products: { productId: id } } }
    );
    await Order.deleteMany({ products: { $size: 0 } });
    await Product.findByIdAndDelete(id);

    res.json({ msg: 'Товар видалено, позицію прибрано з замовлень' });
  } catch (err) {
    console.error('productController.remove error:', err);
    res.status(500).json({ msg: 'Помилка видалення товару' });
  }
};
