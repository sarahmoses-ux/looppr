import { Router } from 'express'
import { login, logout, me, refresh, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { loginValidation, registerValidation } from '../validations/authValidation.js'

const router = Router()

router.post('/client/register', registerValidation, validate, register)
router.post('/client/login', loginLimiter, loginValidation, validate, login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
