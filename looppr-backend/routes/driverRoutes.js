import { Router } from 'express'
import express from 'express'
import {
  acceptDelivery,
  confirmWeight,
  getDriverEarnings,
  getDriverOverview,
  listIncomingDeliveries,
  listMyDeliveries,
  rejectDelivery,
  updateAvailability,
  updateDeliveryStage,
  updateDriverProfile,
  updateLocation,
} from '../controllers/driverController.js'
import { requireDriverAuth } from '../middleware/auth.js'
import { driverLocationLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import {
  driverAvailabilityValidation,
  driverConfirmWeightValidation,
  driverLocationValidation,
  driverRejectDeliveryValidation,
  driverStageValidation,
  driverUpdateProfileValidation,
} from '../validations/driverValidation.js'

const router = Router()

// Every route requires a valid Driver Portal session. Customer/admin/
// business/partner tokens fail requireDriverAuth (dedicated signing secret).
router.use(requireDriverAuth)

router.get('/overview', getDriverOverview)
router.get('/earnings', getDriverEarnings)
router.get('/deliveries/incoming', listIncomingDeliveries)
router.get('/deliveries/mine', listMyDeliveries)
router.post('/deliveries/:id/accept', acceptDelivery)
router.post('/deliveries/:id/reject', driverRejectDeliveryValidation, validate, rejectDelivery)
router.patch('/deliveries/:id/stage', driverStageValidation, validate, updateDeliveryStage)
router.patch('/deliveries/:id/weight', driverConfirmWeightValidation, validate, confirmWeight)

router.patch('/availability', driverAvailabilityValidation, validate, updateAvailability)
router.patch('/location', driverLocationLimiter, driverLocationValidation, validate, updateLocation)
// Profile can carry a data-URL photo, so allow a larger body here too.
router.patch('/profile', express.json({ limit: '8mb' }), driverUpdateProfileValidation, validate, updateDriverProfile)

export default router
