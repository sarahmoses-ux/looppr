import { Router } from 'express'
import {
  businessForgotPassword,
  businessLogin,
  businessLogout,
  businessMe,
  businessRefresh,
  businessRegister,
  businessResendVerification,
  businessResetPassword,
  businessUpdateMe,
  businessVerifyEmail,
} from '../controllers/businessAuthController.js'
import { requireBusinessAuth } from '../middleware/auth.js'
import {
  businessRegisterLimiter,
  businessVerifyLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import {
  businessForgotPasswordValidation,
  businessLoginValidation,
  businessRegisterValidation,
  businessResendVerificationValidation,
  businessResetPasswordValidation,
  businessUpdateMeValidation,
  businessVerifyEmailValidation,
} from '../validations/businessValidation.js'

const router = Router()

router.post('/register', businessRegisterLimiter, businessRegisterValidation, validate, businessRegister)
router.post('/login', loginLimiter, businessLoginValidation, validate, businessLogin)
router.post('/verify-email', businessVerifyLimiter, businessVerifyEmailValidation, validate, businessVerifyEmail)
router.post(
  '/resend-verification',
  businessVerifyLimiter,
  businessResendVerificationValidation,
  validate,
  businessResendVerification,
)

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  businessForgotPasswordValidation,
  validate,
  businessForgotPassword,
)
router.post(
  '/reset-password',
  resetPasswordLimiter,
  businessResetPasswordValidation,
  validate,
  businessResetPassword,
)

router.post('/refresh', businessRefresh)
router.post('/logout', businessLogout)
router.get('/me', requireBusinessAuth, businessMe)
router.patch('/me', requireBusinessAuth, businessUpdateMeValidation, validate, businessUpdateMe)

export default router
