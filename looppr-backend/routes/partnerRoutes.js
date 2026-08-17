import { Router } from 'express'
import express from 'express'
import {
  acceptOrder,
  getPartnerEarnings,
  getPartnerOverview,
  listIncomingOrders,
  listMyOrders,
  listMyPayouts,
  rejectOrder,
  updateAvailability,
  updateOrderStage,
  updatePartnerProfile,
} from '../controllers/partnerController.js'
import { requirePartnerAuth } from '../middleware/auth.js'
import { requireApprovedPartner } from '../middleware/approval.js'
import { validate } from '../middleware/validate.js'
import {
  partnerAvailabilityValidation,
  partnerOrderStatusValidation,
  partnerRejectOrderValidation,
  partnerUpdateProfileValidation,
} from '../validations/partnerValidation.js'

const router = Router()

// Every route requires a valid Partner Portal session. Customer/admin/
// business tokens fail requirePartnerAuth (dedicated signing secret).
// requireApprovedPartner additionally blocks pending/rejected/suspended
// accounts even with an otherwise-valid token (see middleware/approval.js).
router.use(requirePartnerAuth, requireApprovedPartner)

router.get('/overview', getPartnerOverview)
router.get('/earnings', getPartnerEarnings)
router.get('/payouts', listMyPayouts)
router.get('/orders/incoming', listIncomingOrders)
router.get('/orders/mine', listMyOrders)
router.post('/orders/:id/accept', acceptOrder)
router.post('/orders/:id/reject', partnerRejectOrderValidation, validate, rejectOrder)
router.patch('/orders/:id/stage', partnerOrderStatusValidation, validate, updateOrderStage)

router.patch('/availability', partnerAvailabilityValidation, validate, updateAvailability)
// Profile can carry a data-URL logo, so allow a larger body here too.
router.patch('/profile', express.json({ limit: '8mb' }), partnerUpdateProfileValidation, validate, updatePartnerProfile)

export default router
