import { Router } from 'express'
import { submitContactMessage } from '../controllers/contactController.js'
import { contactMessageLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { submitContactMessageValidation } from '../validations/contactValidation.js'

const router = Router()

router.post('/', contactMessageLimiter, submitContactMessageValidation, validate, submitContactMessage)

export default router
