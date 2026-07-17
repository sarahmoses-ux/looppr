import { Router } from 'express'
import express from 'express'
import {
  partnerForgotPassword,
  partnerLogin,
  partnerLogout,
  partnerMe,
  partnerRefresh,
  partnerRegister,
  partnerResendVerification,
  partnerResetPassword,
  partnerVerifyEmail,
} from '../controllers/partnerAuthController.js'
import { requirePartnerAuth } from '../middleware/auth.js'
import {
  forgotPasswordLimiter,
  loginLimiter,
  partnerRegisterLimiter,
  partnerVerifyLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import {
  partnerEmailOnlyValidation,
  partnerLoginValidation,
  partnerRegisterValidation,
  partnerResetPasswordValidation,
  partnerVerifyEmailValidation,
} from '../validations/partnerValidation.js'

const router = Router()

// Registration can carry data-URL file uploads (logo/images), so it gets a
// larger JSON body limit than the app-wide 1mb default.
router.post(
  '/register',
  express.json({ limit: '8mb' }),
  partnerRegisterLimiter,
  partnerRegisterValidation,
  validate,
  partnerRegister,
)
router.post('/login', loginLimiter, partnerLoginValidation, validate, partnerLogin)
router.post('/verify-email', partnerVerifyLimiter, partnerVerifyEmailValidation, validate, partnerVerifyEmail)
router.post('/resend-verification', partnerVerifyLimiter, partnerEmailOnlyValidation, validate, partnerResendVerification)

router.post('/forgot-password', forgotPasswordLimiter, partnerEmailOnlyValidation, validate, partnerForgotPassword)
router.post('/reset-password', resetPasswordLimiter, partnerResetPasswordValidation, validate, partnerResetPassword)

router.post('/refresh', partnerRefresh)
router.post('/logout', partnerLogout)
router.get('/me', requirePartnerAuth, partnerMe)

export default router
