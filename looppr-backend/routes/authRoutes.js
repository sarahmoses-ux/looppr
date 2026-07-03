import { Router } from 'express'
import {
  login,
  logout,
  me,
  refresh,
  register,
  resendLoginOtp,
  verifyLoginOtp,
} from '../controllers/authController.js'
import { sendOtp, verifyOtp } from '../controllers/otpController.js'
import { requireAuth } from '../middleware/auth.js'
import {
  loginLimiter,
  loginOtpResendLimiter,
  loginOtpVerifyLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { loginValidation, registerValidation } from '../validations/authValidation.js'

const router = Router()

router.post('/client/register', registerValidation, validate, register)
router.post('/client/login', loginLimiter, loginValidation, validate, login)
router.post('/client/login/verify-otp', loginOtpVerifyLimiter, verifyLoginOtp)
router.post('/client/login/resend-otp', loginOtpResendLimiter, resendLoginOtp)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

router.post('/otp/send', requireAuth, otpSendLimiter, sendOtp)
router.post('/otp/verify', requireAuth, otpVerifyLimiter, verifyOtp)

export default router
