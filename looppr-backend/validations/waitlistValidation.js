import { body } from 'express-validator'

export const joinWaitlistValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
]
