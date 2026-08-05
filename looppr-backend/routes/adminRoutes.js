import { Router } from 'express'
import {
  getStats,
  listAllPickups,
  listCustomers,
  sendPaymentRequest,
  updateOrderStatus,
} from '../controllers/adminController.js'
import {
  approveDriverApplication,
  approvePartnerApplication,
  listDriverApplications,
  listPartnerApplications,
  rejectDriverApplication,
  rejectPartnerApplication,
} from '../controllers/adminApplicationsController.js'
import { listContactMessages, resolveContactMessage } from '../controllers/adminContactController.js'
import { listActivity } from '../controllers/adminActivityController.js'
import { getIntakeStats } from '../controllers/adminDataController.js'
import {
  listBusinessAccounts,
  listBusinessLeads,
  markBusinessLeadContacted,
} from '../controllers/adminCrmController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { adminRejectApplicationValidation, updateOrderStatusValidation } from '../validations/adminValidation.js'

const router = Router()

// Every route below requires a valid session AND role: 'admin'.
router.use(requireAuth, requireRole('admin'))

router.get('/stats', getStats)
router.get('/customers', listCustomers)
router.get('/pickups', listAllPickups)
router.post('/pickups/:id/send-payment-request', sendPaymentRequest)
router.patch('/pickups/:id/status', updateOrderStatusValidation, validate, updateOrderStatus)

router.get('/partners', listPartnerApplications)
router.get('/drivers', listDriverApplications)
router.post('/partners/:id/approve', approvePartnerApplication)
router.post('/partners/:id/reject', adminRejectApplicationValidation, validate, rejectPartnerApplication)
router.post('/drivers/:id/approve', approveDriverApplication)
router.post('/drivers/:id/reject', adminRejectApplicationValidation, validate, rejectDriverApplication)

router.get('/contact-messages', listContactMessages)
router.post('/contact-messages/:id/resolve', resolveContactMessage)

router.get('/business-leads', listBusinessLeads)
router.post('/business-leads/:id/mark-contacted', markBusinessLeadContacted)
router.get('/business-accounts', listBusinessAccounts)

router.get('/activity-log', listActivity)

router.get('/data-collection', getIntakeStats)

export default router
