import { body } from 'express-validator'
import { ALL_STATUSES } from '../constants/orderStatus.js'

export const updateOrderStatusValidation = [
  body('status').isIn(ALL_STATUSES).withMessage('Invalid status.'),
]

export const adminRejectApplicationValidation = [
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason is too long.'),
]
