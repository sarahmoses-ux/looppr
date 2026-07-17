import { Router } from 'express'
import {
  createBusinessPickup,
  getBusinessOverview,
  listBusinessPickups,
} from '../controllers/businessController.js'
import { requireBusinessAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { businessCreatePickupValidation } from '../validations/businessValidation.js'

const router = Router()

// Every route below requires a valid Business Portal session. A customer or
// admin access token fails requireBusinessAuth outright (different signing
// secret), so those sessions can never reach business data.
router.use(requireBusinessAuth)

router.get('/overview', getBusinessOverview)
router.get('/pickups', listBusinessPickups)
router.post('/pickups', businessCreatePickupValidation, validate, createBusinessPickup)

export default router
