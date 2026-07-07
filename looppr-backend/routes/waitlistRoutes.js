import { Router } from 'express'
import { joinWaitlist } from '../controllers/waitlistController.js'
import { waitlistJoinLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { joinWaitlistValidation } from '../validations/waitlistValidation.js'

const router = Router()

router.post('/', waitlistJoinLimiter, joinWaitlistValidation, validate, joinWaitlist)

export default router
