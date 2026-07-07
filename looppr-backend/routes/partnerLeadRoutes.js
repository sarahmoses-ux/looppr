import { Router } from 'express'
import { submitPartnerLead } from '../controllers/partnerLeadController.js'
import { partnerLeadLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { submitPartnerLeadValidation } from '../validations/partnerLeadValidation.js'

const router = Router()

router.post('/', partnerLeadLimiter, submitPartnerLeadValidation, validate, submitPartnerLead)

export default router
