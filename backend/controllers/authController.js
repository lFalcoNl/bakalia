// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email і пароль потрібні' });
    }

    // Якщо користувач уже існує
    if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ message: 'Користувач з таким email вже існує' });
    }

    const hash = await bcrypt.hash(password, 10);
    await new User({ email, password: hash }).save();

    return res
      .status(201)
      .json({ message: 'Зареєстровано. Очікуйте підтвердження адміністратора.' });
  } catch (err) {
    console.error(err);
    // дублікати індексу (на всякий випадок)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'Email має бути унікальним' });
    }
    return res
      .status(500)
      .json({ message: 'Внутрішня помилка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email і пароль потрібні' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Неправильні дані' });
    }

    // Перевіряємо, чи адмін підтвердив акаунт
    if (!user.isApproved) {
      return res
        .status(403)
        .json({ message: 'Ваш акаунт ще очікує підтвердження адміністратора' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(400)
        .json({ message: 'Неправильні дані' });
    }

    // Створюємо токен
    const payload = {
      id: user._id,
      role: user.role,
      email: user.email
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Внутрішня помилка сервера' });
  }
};
