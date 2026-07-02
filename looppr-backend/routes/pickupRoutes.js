import { Router } from 'express'
import { createPickup, listMyPickups } from '../controllers/pickupController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createPickupValidation } from '../validations/pickupValidation.js'

const router = Router()

router.use(requireAuth)
router.post('/', createPickupValidation, validate, createPickup)
router.get('/me', listMyPickups)

export default router
