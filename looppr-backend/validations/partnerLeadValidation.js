import { body } from 'express-validator'

export const submitPartnerLeadValidation = [
  body('type').isIn(['laundromat', 'driver']).withMessage('Invalid lead type.'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^\+?[0-9\s()-]{7,20}$/)
    .withMessage('Enter a valid phone number.'),
  body('businessName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Business name must be 150 characters or fewer.'),
  body('message')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be 1000 characters or fewer.'),
]
