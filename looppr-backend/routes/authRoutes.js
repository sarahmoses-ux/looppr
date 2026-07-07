import { Router } from 'express'
import {
  adminLogin,
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resendLoginOtp,
  resetPassword,
  updateMe,
  verifyLoginOtp,
} from '../controllers/authController.js'
import { sendOtp, verifyOtp } from '../controllers/otpController.js'
import { requireAuth } from '../middleware/auth.js'
import {
  changePasswordLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  loginOtpResendLimiter,
  loginOtpVerifyLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import {
  changePasswordValidation,
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  updateMeValidation,
} from '../validations/authValidation.js'

const router = Router()

router.post('/client/register', registerValidation, validate, register)
router.post('/client/login', loginLimiter, loginValidation, validate, login)
router.post('/client/login/verify-otp', loginOtpVerifyLimiter, verifyLoginOtp)
router.post('/client/login/resend-otp', loginOtpResendLimiter, resendLoginOtp)

// No /admin/register — admin accounts are only created via scripts/seedAdmin.js.
// verify-otp/resend-otp are role-agnostic (they operate on whichever user the
// challengeToken points to), so the same handlers are reused here.
router.post('/admin/login', loginLimiter, loginValidation, validate, adminLogin)
router.post('/admin/login/verify-otp', loginOtpVerifyLimiter, verifyLoginOtp)
router.post('/admin/login/resend-otp', loginOtpResendLimiter, resendLoginOtp)

router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, validate, forgotPassword)
router.post('/reset-password', resetPasswordLimiter, resetPasswordValidation, validate, resetPassword)

router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.patch('/me', requireAuth, updateMeValidation, validate, updateMe)
router.post(
  '/change-password',
  requireAuth,
  changePasswordLimiter,
  changePasswordValidation,
  validate,
  changePassword,
)

router.post('/otp/send', requireAuth, otpSendLimiter, sendOtp)
router.post('/otp/verify', requireAuth, otpVerifyLimiter, verifyOtp)

export default router
