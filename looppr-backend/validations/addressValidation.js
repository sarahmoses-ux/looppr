import { body } from 'express-validator'

const OK_STATES = ['OK']

export const addAddressValidation = [
  body('label').optional({ values: 'falsy' }).trim().isLength({ max: 50 }).withMessage('Label must be 50 characters or fewer.'),
  body('street').trim().isLength({ min: 3, max: 200 }).withMessage('Enter a valid street address.'),
  body('apartment')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Apartment/unit must be 50 characters or fewer.'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a valid city.'),
  body('state')
    .optional({ values: 'falsy' })
    .trim()
    .toUpperCase()
    .isIn(OK_STATES)
    .withMessage('Looppr only serves Oklahoma at launch.'),
  body('zip')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Enter a valid ZIP code.'),
]
