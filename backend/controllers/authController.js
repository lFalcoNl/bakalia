const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { surname, street, phone, password } = req.body;
  if (!surname || !street || !phone || !password) {
    return res.status(400).json({ message: 'Всі поля обов’язкові' });
  }
  try {
    if (await User.findOne({ phone })) {
      return res.status(409).json({ message: 'Телефон уже використовується' });
    }
    const hash = await bcrypt.hash(password, 10);
    await new User({ surname, street, phone, password: hash }).save();
    return res
      .status(201)
      .json({ message: 'Зареєстровано. Очікуйте підтвердження адміністратора.' });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Телефон має бути унікальним' });
    }
    return res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: 'Телефон і пароль обов’язкові' });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Невірні дані' });
    }
    if (!user.isApproved) {
      return res
        .status(403)
        .json({ message: 'Ваш акаунт ще не підтверджено адміністратором' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Невірні дані' });
    }
    const payload = {
      id: user._id,
      role: user.role,
      surname: user.surname,
      phone: user.phone
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
};
