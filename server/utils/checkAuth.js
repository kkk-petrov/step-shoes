import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.userID = decoded._id;
      return next();
    } catch (err) {
      return res.status(403).json({ msg: 'Нет доступа' });
    }
  }

  next();
};
