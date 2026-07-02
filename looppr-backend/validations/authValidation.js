import { body } from 'express-validator'

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^\+?[0-9\s()-]{7,20}$/)
    .withMessage('Enter a valid phone number.'),
  body('password')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
]

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'),
]
