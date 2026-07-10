import { body } from 'express-validator'

const OK_STATES = ['OK']

// Shared by both the account (address/deliveryAddress) and guest
// (address/deliveryAddress) validators — a delivery address is optional,
// but if the customer chose "different from pickup" it must be complete.
export function deliveryAddressValidator(field) {
  return body(field)
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (!value.street || value.street.trim().length < 3) throw new Error('Enter a valid delivery street address.')
      if (!value.apartment || !value.apartment.trim()) throw new Error('Enter a delivery apartment/unit number.')
      if (!value.city || value.city.trim().length < 2) throw new Error('Enter a valid delivery city.')
      if (!value.state || !OK_STATES.includes(value.state.trim().toUpperCase())) {
        throw new Error('Looppr only serves Oklahoma at launch.')
      }
      if (!value.zip || !/^\d{5}(-\d{4})?$/.test(value.zip.trim())) throw new Error('Enter a valid delivery ZIP code.')
      return true
    })
}

export const createPickupValidation = [
  body('address.street').trim().isLength({ min: 3, max: 200 }).withMessage('Enter a valid street address.'),
  body('address.apartment')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Enter your apartment/unit number.'),
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
  body('deliveryWindow').isIn(['morning', 'afternoon', 'evening']).withMessage('Choose a delivery window.'),
  deliveryAddressValidator('deliveryAddress'),
]
