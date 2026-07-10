import { body } from 'express-validator'
import { CONTACT_PURPOSES } from '../models/ContactMessage.js'

export const submitContactMessageValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^\+?[0-9\s()-]{7,20}$/)
    .withMessage('Enter a valid phone number.'),
  body('purpose').isIn(CONTACT_PURPOSES).withMessage('Choose a reason for contacting us.'),
  body('message').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('Message must be 2000 characters or fewer.'),
]
