import { Router } from 'express'
import { createGuestPickup, getGuestPickup, payGuestOrder } from '../controllers/guestPickupController.js'
import { guestCheckoutCompleteLimiter, guestPickupCreateLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { createGuestPickupValidation } from '../validations/guestPickupValidation.js'

// Mounted at /api/pickups/guest — deliberately BEFORE /api/pickups (which
// requires auth for everything) in server.js, so these stay public.
const router = Router()

router.post('/', guestPickupCreateLimiter, createGuestPickupValidation, validate, createGuestPickup)
router.get('/:id', getGuestPickup)
router.post('/:id/pay', guestCheckoutCompleteLimiter, payGuestOrder)

export default router
