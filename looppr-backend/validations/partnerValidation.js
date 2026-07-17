import { body } from 'express-validator'
import { PARTNER_SERVICES } from '../models/PartnerUser.js'

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
const PHONE_RULE = /^\+?[0-9\s()-]{7,20}$/

export const partnerRegisterValidation = [
  body('businessName').trim().isLength({ min: 2, max: 150 }).withMessage('Enter your laundry business name.'),
  body('ownerName').trim().isLength({ min: 2, max: 100 }).withMessage('Enter the owner name.'),
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('phone').trim().matches(PHONE_RULE).withMessage('Enter a valid phone number.'),
  body('password')
    .matches(PASSWORD_RULE)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
  body('address').trim().isLength({ min: 3, max: 200 }).withMessage('Enter your business address.'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your city.'),
  body('state').optional().trim().isLength({ min: 2, max: 2 }).withMessage('Use the 2-letter state code.'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('yearsInBusiness').optional().isInt({ min: 0, max: 200 }).withMessage('Enter a valid number of years.'),
  body('employeeCount').optional().isInt({ min: 0, max: 100000 }).withMessage('Enter a valid employee count.'),
  body('maxDailyCapacity').optional().isInt({ min: 0, max: 100000 }).withMessage('Enter a valid daily capacity.'),
  body('servicesOffered').optional().isArray().withMessage('Select the services you offer.'),
  body('servicesOffered.*').optional().isIn(PARTNER_SERVICES).withMessage('Invalid service selected.'),
  body('pickupAvailable').optional().isBoolean(),
  body('deliveryAvailable').optional().isBoolean(),
  body('agreedToTerms').equals('true').withMessage('You must agree to the Partner Terms and Privacy Policy.'),
]

export const partnerLoginValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'),
  body('rememberMe').optional().isBoolean(),
]

export const partnerVerifyEmailValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('code').matches(/^\d{6}$/).withMessage('Enter the 6-digit code.'),
]

export const partnerEmailOnlyValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
]

export const partnerResetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid business email.').normalizeEmail(),
  body('code').matches(/^\d{6}$/).withMessage('Enter the 6-digit code.'),
  body('newPassword')
    .matches(PASSWORD_RULE)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
]

export const partnerUpdateProfileValidation = [
  body('businessName').optional().trim().isLength({ min: 2, max: 150 }),
  body('ownerName').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().matches(PHONE_RULE).withMessage('Enter a valid phone number.'),
  body('address').optional().trim().isLength({ min: 3, max: 200 }),
  body('city').optional().trim().isLength({ min: 2, max: 100 }),
  body('state').optional().trim().isLength({ min: 2, max: 2 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('yearsInBusiness').optional().isInt({ min: 0, max: 200 }),
  body('employeeCount').optional().isInt({ min: 0, max: 100000 }),
  body('maxDailyCapacity').optional().isInt({ min: 0, max: 100000 }),
  body('servicesOffered').optional().isArray(),
  body('servicesOffered.*').optional().isIn(PARTNER_SERVICES),
  body('pickupAvailable').optional().isBoolean(),
  body('deliveryAvailable').optional().isBoolean(),
  body('operatingHours').optional().isArray(),
]

export const partnerAvailabilityValidation = [
  body('availability').isIn(['online', 'offline']).withMessage('Availability must be online or offline.'),
]

export const partnerRejectOrderValidation = [
  body('reason').trim().isLength({ min: 2, max: 300 }).withMessage('Give a short reason for rejecting.'),
]

export const partnerOrderStatusValidation = [
  body('action')
    .isIn(['pickup_completed', 'laundry_in_progress', 'ready_for_delivery', 'delivered'])
    .withMessage('Invalid order action.'),
]
