import { Router } from 'express'
import express from 'express'
import {
  driverForgotPassword,
  driverLogin,
  driverLogout,
  driverMe,
  driverRefresh,
  driverRegister,
  driverResendVerification,
  driverResetPassword,
  driverVerifyEmail,
} from '../controllers/driverAuthController.js'
import { requireDriverAuth } from '../middleware/auth.js'
import {
  driverRegisterLimiter,
  driverVerifyLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import {
  driverEmailOnlyValidation,
  driverLoginValidation,
  driverRegisterValidation,
  driverResetPasswordValidation,
  driverVerifyEmailValidation,
} from '../validations/driverValidation.js'

const router = Router()

// Registration can carry a data-URL profile photo, so it gets a larger JSON
// body limit than the app-wide 1mb default.
router.post(
  '/register',
  express.json({ limit: '8mb' }),
  driverRegisterLimiter,
  driverRegisterValidation,
  validate,
  driverRegister,
)
router.post('/login', loginLimiter, driverLoginValidation, validate, driverLogin)
router.post('/verify-email', driverVerifyLimiter, driverVerifyEmailValidation, validate, driverVerifyEmail)
router.post('/resend-verification', driverVerifyLimiter, driverEmailOnlyValidation, validate, driverResendVerification)

router.post('/forgot-password', forgotPasswordLimiter, driverEmailOnlyValidation, validate, driverForgotPassword)
router.post('/reset-password', resetPasswordLimiter, driverResetPasswordValidation, validate, driverResetPassword)

router.post('/refresh', driverRefresh)
router.post('/logout', driverLogout)
router.get('/me', requireDriverAuth, driverMe)

export default router
