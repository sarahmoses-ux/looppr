import { body } from 'express-validator'
import { BUSINESS_TYPES } from '../models/BusinessUser.js'

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
const PHONE_RULE = /^\+?[0-9\s()-]{7,20}$/

export const businessRegisterValidation = [
  body('businessName').trim().isLength({ min: 2, max: 150 }).withMessage('Enter your business name.'),
  body('businessType').isIn(BUSINESS_TYPES).withMessage('Select your business type.'),
  body('contactPerson').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a contact name.'),
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('phone').trim().matches(PHONE_RULE).withMessage('Enter a valid phone number.'),
  body('password')
    .matches(PASSWORD_RULE)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
  body('address').trim().isLength({ min: 3, max: 200 }).withMessage('Enter your business address.'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your city.'),
  body('state').optional().trim().isLength({ min: 2, max: 2 }).withMessage('Use the 2-letter state code.'),
  body('weeklyVolume').optional().trim().isLength({ max: 100 }).withMessage('Keep this under 100 characters.'),
  body('registrationNumber').optional().trim().isLength({ max: 60 }).withMessage('Keep this under 60 characters.'),
]

export const businessLoginValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'),
  body('rememberMe').optional().isBoolean().withMessage('Invalid value.'),
]

export const businessVerifyEmailValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('code').matches(/^\d{6}$/).withMessage('Enter the 6-digit code.'),
]

export const businessResendVerificationValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
]

export const businessForgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
]

export const businessResetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('code').matches(/^\d{6}$/).withMessage('Enter the 6-digit code.'),
  body('newPassword')
    .matches(PASSWORD_RULE)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
]

export const businessUpdateMeValidation = [
  body('businessName').optional().trim().isLength({ min: 2, max: 150 }),
  body('contactPerson').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().matches(PHONE_RULE).withMessage('Enter a valid phone number.'),
  body('address').optional().trim().isLength({ min: 3, max: 200 }),
  body('city').optional().trim().isLength({ min: 2, max: 100 }),
  body('state').optional().trim().isLength({ min: 2, max: 2 }),
  body('weeklyVolume').optional().trim().isLength({ max: 100 }),
  body('registrationNumber').optional().trim().isLength({ max: 60 }),
]

// Pickup requested from the dashboard. Mirrors createPickupValidation
// (looppr-backend/validations/pickupValidation.js) — same address rules,
// since both write to the shared PickupRequest model, whose address.apartment
// is required and whose state is Oklahoma-only at launch.
export const businessCreatePickupValidation = [
  body('address.street').trim().isLength({ min: 3, max: 200 }).withMessage('Enter a pickup street address.'),
  body('address.apartment').trim().isLength({ min: 1, max: 50 }).withMessage('Enter a suite/unit number.'),
  body('address.city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a city.'),
  body('address.state').trim().toUpperCase().isIn(['OK']).withMessage('Looppr only serves Oklahoma at launch.'),
  body('address.zip').trim().matches(/^\d{5}(-\d{4})?$/).withMessage('Enter a valid ZIP code.'),
  body('preferredDate').isISO8601().withMessage('Choose a pickup date.'),
  body('window').isIn(['morning', 'afternoon', 'evening']).withMessage('Choose a pickup window.'),
  body('deliveryWindow').isIn(['morning', 'afternoon', 'evening']).withMessage('Choose a delivery window.'),
  // 'small' (~10 lbs) is the smallest accepted load — enforces the 10 lb
  // per-pickup minimum server-side, same as the customer flow.
  body('loadSize').isIn(['small', 'medium', 'large']).withMessage('Choose a load size (10 lb minimum).'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
]
