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
  updateDriverStatus,
  updatePartnerStatus,
} from '../controllers/adminApplicationsController.js'
import { assignDriverToOrder, assignPartnerToOrder } from '../controllers/adminAssignmentController.js'
import { listContactMessages, resolveContactMessage } from '../controllers/adminContactController.js'
import { listActivity } from '../controllers/adminActivityController.js'
import { getIntakeStats } from '../controllers/adminDataController.js'
import {
  listBusinessAccounts,
  listBusinessLeads,
  markBusinessLeadContacted,
} from '../controllers/adminCrmController.js'
import {
  createAdminUser,
  listAdminUsers,
  updateAdminUserProfile,
  updateAdminUserRole,
} from '../controllers/adminUsersController.js'
import { generatePayout, listPayouts, markPayoutPaid } from '../controllers/adminPayoutsController.js'
import { advanceInvoiceStatus, generateInvoice, listInvoices } from '../controllers/adminInvoicesController.js'
import { requireAdminRole, requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  adminRejectApplicationValidation,
  adminUpdateAccountStatusValidation,
  advanceInvoiceStatusValidation,
  createAdminUserValidation,
  generateInvoiceValidation,
  generatePayoutValidation,
  updateAdminUserProfileValidation,
  updateAdminUserRoleValidation,
  updateOrderStatusValidation,
} from '../validations/adminValidation.js'

const router = Router()

// Every route below requires a valid session AND role: 'admin'. Beyond
// that, most routes are further scoped with requireAdminRole(...) — see
// models/User.js's ADMIN_ROLES and middleware/auth.js for how sub-roles
// work. Routes with no requireAdminRole are open to every admin sub-role
// (dashboard stats, customers, order/lead reads, CRM reads).
router.use(requireAuth, requireRole('admin'))

router.get('/stats', getStats)
router.get('/customers', listCustomers)
router.get('/pickups', listAllPickups)
router.post('/pickups/:id/send-payment-request', requireAdminRole('ops'), sendPaymentRequest)
router.patch('/pickups/:id/status', requireAdminRole('ops'), updateOrderStatusValidation, validate, updateOrderStatus)
router.post('/pickups/:id/assign-partner', requireAdminRole('ops'), assignPartnerToOrder)
router.post('/pickups/:id/assign-driver', requireAdminRole('ops'), assignDriverToOrder)

// Applications (partner/driver review + suspend/reactivate) — ops only;
// support has no reason to touch onboarding decisions.
router.get('/partners', requireAdminRole('ops'), listPartnerApplications)
router.get('/drivers', requireAdminRole('ops'), listDriverApplications)
router.post('/partners/:id/approve', requireAdminRole('ops'), approvePartnerApplication)
router.post(
  '/partners/:id/reject',
  requireAdminRole('ops'),
  adminRejectApplicationValidation,
  validate,
  rejectPartnerApplication,
)
router.patch(
  '/partners/:id/status',
  requireAdminRole('ops'),
  adminUpdateAccountStatusValidation,
  validate,
  updatePartnerStatus,
)
router.post('/drivers/:id/approve', requireAdminRole('ops'), approveDriverApplication)
router.post(
  '/drivers/:id/reject',
  requireAdminRole('ops'),
  adminRejectApplicationValidation,
  validate,
  rejectDriverApplication,
)
router.patch(
  '/drivers/:id/status',
  requireAdminRole('ops'),
  adminUpdateAccountStatusValidation,
  validate,
  updateDriverStatus,
)

// Customer Care (contact form inbox) — support's home base; ops doesn't
// need it.
router.get('/contact-messages', requireAdminRole('support'), listContactMessages)
router.post('/contact-messages/:id/resolve', requireAdminRole('support'), resolveContactMessage)

router.get('/business-leads', listBusinessLeads)
router.post('/business-leads/:id/mark-contacted', requireAdminRole('ops'), markBusinessLeadContacted)
router.get('/business-accounts', listBusinessAccounts)

// Activity Log surfaces the partner/driver update feed too (see
// adminApplicationsController.js) — ops is the role that actually acts on
// those applications day to day, so it gets visibility here as well.
router.get('/activity-log', requireAdminRole('ops'), listActivity)

router.get('/data-collection', requireAdminRole(), getIntakeStats)

// Admin Users (assign ops/support/super_admin) — super_admin only. Passing
// no extra roles to requireAdminRole means only super_admin (the implicit
// bypass) can pass.
router.get('/admin-users', requireAdminRole(), listAdminUsers)
router.post('/admin-users', requireAdminRole(), createAdminUserValidation, validate, createAdminUser)
router.patch('/admin-users/:id/role', requireAdminRole(), updateAdminUserRoleValidation, validate, updateAdminUserRole)
router.patch(
  '/admin-users/:id',
  requireAdminRole(),
  updateAdminUserProfileValidation,
  validate,
  updateAdminUserProfile,
)

// Payouts & Invoices — financial data, super_admin only (same tier as
// Reports/Data Collection).
router.get('/payouts', requireAdminRole(), listPayouts)
router.post('/payouts', requireAdminRole(), generatePayoutValidation, validate, generatePayout)
router.post('/payouts/:id/mark-paid', requireAdminRole(), markPayoutPaid)

router.get('/invoices', requireAdminRole(), listInvoices)
router.post('/invoices', requireAdminRole(), generateInvoiceValidation, validate, generateInvoice)
router.patch('/invoices/:id/status', requireAdminRole(), advanceInvoiceStatusValidation, validate, advanceInvoiceStatus)

export default router
