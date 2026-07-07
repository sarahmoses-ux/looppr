import { body } from 'express-validator'

export const submitContactMessageValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be at least 10 characters.'),
]
