import { Router } from 'express'
import { createPickup, getMyStats, listMyPickups, payMyOrder } from '../controllers/pickupController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createPickupValidation } from '../validations/pickupValidation.js'

const router = Router()

router.use(requireAuth)
router.post('/', createPickupValidation, validate, createPickup)
router.get('/me', listMyPickups)
router.get('/me/stats', getMyStats)
router.post('/:id/pay', payMyOrder)

export default router
