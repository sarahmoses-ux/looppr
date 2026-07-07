import { body } from 'express-validator'

const OK_STATES = ['OK']

export const createGuestPickupValidation = [
  body('guest.name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('guest.email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('guest.phone')
    .trim()
    .matches(/^\+?[0-9\s()-]{7,20}$/)
    .withMessage('Enter a valid phone number.'),
  body('address.street').trim().isLength({ min: 3, max: 200 }).withMessage('Enter a valid street address.'),
  body('address.city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a valid city.'),
  body('address.state')
    .trim()
    .toUpperCase()
    .isIn(OK_STATES)
    .withMessage('Looppr only serves Oklahoma at launch.'),
  body('address.zip')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Enter a valid ZIP code.'),
  body('preferredDate')
    .isISO8601()
    .withMessage('Choose a valid date.')
    .custom((value) => {
      const chosen = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (chosen < today) throw new Error('Choose a date in the future.')
      return true
    }),
  body('window').isIn(['morning', 'afternoon', 'evening']).withMessage('Choose a pickup window.'),
  body('loadSize').isIn(['small', 'medium', 'large']).withMessage('Choose a load size.'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('Notes must be 500 characters or fewer.'),
]

