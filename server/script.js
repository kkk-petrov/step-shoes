import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';

import { registerValidation } from './auth.js';
import UserModel from './models/User.js';
import checkAuth from './utils/checkAuth.js';

dotenv.config();
const app = express();

app.use(express.json());

mongoose
  .connect('mongodb+srv://root:root@cluster0.ao022ri.mongodb.net/step?retryWrites=true&w=majority')
  .then(console.log('DB Ok'))
  .catch((err) => {
    console.log('Error', err);
  });

app.post('/account/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    } else {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const doc = new UserModel({
        email: req.body.email,
        name: req.body.name,
        avatar: req.body.avatar,
        passwordHash: hash,
      });
      const user = await doc.save();

      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: '30d',
        },
      );

      const { passwordHash, ...userData } = user._doc;

      res.json({
        ...userData,
        token,
      });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Не удалось зарегистрироваться' });
  }
});

app.post('/account/login', async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!user || !isValidPass) {
      return res.status(400).json({ msg: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Не удалось авторизоваться' });
  }
});

app.get('/account', checkAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userID);

    if (!user) {
      return res.status(404).json({ msg: 'Пользователь не найден' });
    }

    const { passwordHash, ...userData } = user._doc;

    return res.json(userData);
  } catch (err) {
    return res.status(500).json({ msg: 'Нет доступа' });
  }
});

app.listen(process.env.PORT, (err) => {
  if (err) return console.log(err);

  console.log(`Server started on port ${process.env.PORT}`);
});
