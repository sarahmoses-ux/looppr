import { Router } from 'express'
import {
  getStats,
  listAllPickups,
  listCustomers,
  sendPaymentRequest,
  updateOrderStatus,
} from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateOrderStatusValidation } from '../validations/adminValidation.js'

const router = Router()

// Every route below requires a valid session AND role: 'admin'.
router.use(requireAuth, requireRole('admin'))

router.get('/stats', getStats)
router.get('/customers', listCustomers)
router.get('/pickups', listAllPickups)
router.post('/pickups/:id/send-payment-request', sendPaymentRequest)
router.patch('/pickups/:id/status', updateOrderStatusValidation, validate, updateOrderStatus)

export default router
