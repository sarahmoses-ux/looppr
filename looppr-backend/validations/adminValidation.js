import { body } from 'express-validator'
import { ALL_STATUSES } from '../constants/orderStatus.js'
import { ADMIN_ROLES } from '../models/User.js'

export const updateOrderStatusValidation = [
  body('status').isIn(ALL_STATUSES).withMessage('Invalid status.'),
]

export const adminRejectApplicationValidation = [
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason is too long.'),
]

export const adminUpdateAccountStatusValidation = [
  body('accountStatus').isIn(['active', 'suspended']).withMessage('Invalid account status.'),
]

export const createAdminUserValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone')
    .matches(/^\+?[0-9\s()-]{7,20}$/)
    .withMessage('A valid phone number is required.'),
  body('password')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage('Password must be at least 8 characters, including a letter and a number.'),
  body('adminRole').isIn(ADMIN_ROLES).withMessage('Invalid admin role.'),
]

export const updateAdminUserRoleValidation = [
  body('adminRole').isIn(ADMIN_ROLES).withMessage('Invalid admin role.'),
]
