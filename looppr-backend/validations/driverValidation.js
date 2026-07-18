import { body } from 'express-validator'
import { DRIVER_VEHICLE_TYPES } from '../models/DriverUser.js'

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
const PHONE_RULE = /^\+?[0-9\s()-]{7,20}$/

export const driverRegisterValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').trim().matches(PHONE_RULE).withMessage('Enter a valid phone number.'),
  body('password')
    .matches(PASSWORD_RULE)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
  body('address').trim().isLength({ min: 3, max: 200 }).withMessage('Enter your address.'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your city.'),
  body('state').optional().trim().isLength({ min: 2, max: 2 }).withMessage('Use the 2-letter state code.'),
  body('vehicleType').isIn(DRIVER_VEHICLE_TYPES).withMessage('Select your vehicle type.'),
  body('vehicleName').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your vehicle name (e.g. Toyota Corolla).'),
  body('licenseNumber').optional().trim().isLength({ max: 40 }),
  body('vehiclePlate').optional().trim().isLength({ max: 20 }),
  body('agreedToTerms').equals('true').withMessage('You must agree to continue.'),
]

export const driverLoginValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'),
  body('rememberMe').optional().isBoolean(),
]

export const driverVerifyEmailValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('code').matches(/^\d{6}$/).withMessage('Enter the 6-digit code.'),
]

export const driverEmailOnlyValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
]

export const driverResetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('code').matches(/^\d{6}$/).withMessage('Enter the 6-digit code.'),
  body('newPassword')
    .matches(PASSWORD_RULE)
    .withMessage('Password must be at least 8 characters and include a letter and a number.'),
]

export const driverUpdateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().matches(PHONE_RULE).withMessage('Enter a valid phone number.'),
  body('address').optional().trim().isLength({ min: 3, max: 200 }),
  body('city').optional().trim().isLength({ min: 2, max: 100 }),
  body('state').optional().trim().isLength({ min: 2, max: 2 }),
  body('vehicleType').optional().isIn(DRIVER_VEHICLE_TYPES),
  body('vehicleName').optional().trim().isLength({ min: 2, max: 100 }),
  body('licenseNumber').optional().trim().isLength({ max: 40 }),
  body('vehiclePlate').optional().trim().isLength({ max: 20 }),
]

export const driverAvailabilityValidation = [
  body('availability')
    .isIn(['online', 'offline'])
    .withMessage('Availability must be online or offline.'),
]

export const driverLocationValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude.'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude.'),
]

export const driverRejectDeliveryValidation = [
  body('reason').trim().isLength({ min: 2, max: 300 }).withMessage('Give a short reason for rejecting.'),
]

export const driverStageValidation = [
  body('action')
    .isIn(['pickup_completed', 'at_laundromat', 'out_for_delivery', 'delivered'])
    .withMessage('Invalid delivery action.'),
]

export const driverConfirmWeightValidation = [
  body('actualWeightLbs')
    .isFloat({ min: 0.1, max: 500 })
    .withMessage('Enter a valid weight in pounds.'),
]
