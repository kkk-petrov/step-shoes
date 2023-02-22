import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail(),
  body('name').isLength({ min: 2 }),
  body('password').isLength({ min: 8 }),
  body('avatar').optional().isURL(),
];
