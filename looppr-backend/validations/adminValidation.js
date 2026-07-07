import { body } from 'express-validator'
import { ALL_STATUSES } from '../constants/orderStatus.js'

export const updateOrderStatusValidation = [
  body('status').isIn(ALL_STATUSES).withMessage('Invalid status.'),
]
