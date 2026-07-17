import bcrypt from 'bcryptjs'
import { BusinessUser } from '../models/BusinessUser.js'
import { sendOtpEmail, sendPasswordResetEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import { issueBusinessSession, publicBusiness } from '../utils/session.js'
import { verifyBusinessRefreshToken } from '../utils/tokens.js'

async function sendVerificationCode(business) {
  const code = await assignOtp(business)
  await sendOtpEmail(business.email, business.contactPerson, code)
}

// Step 1 of onboarding: create the account (unverified) and email a 6-digit
// verification code. No session is issued until the email is verified — the
// frontend routes to /business/verify-email with the returned email.
export const businessRegister = asyncHandler(async (req, res) => {
  const {
    businessName,
    businessType,
    contactPerson,
    email,
    phone,
    password,
    address,
    city,
    state,
    weeklyVolume,
    registrationNumber,
  } = req.body

  const existing = await BusinessUser.findOne({ email })
  if (existing) throw new ApiError(409, 'A business account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)
  const business = await BusinessUser.create({
    businessName,
    businessType,
    contactPerson,
    email,
    phone,
    passwordHash,
    address,
    city,
    state,
    weeklyVolume,
    registrationNumber,
  })

  try {
    await sendVerificationCode(business)
  } catch (err) {
    console.error('Failed to send business verification email', err)
  }

  res.status(201).json({ success: true, requiresVerification: true, email: business.email })
})

// Step 2: verify the emailed code, mark the account verified, and sign in.
export const businessVerifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  const business = await BusinessUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!business) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(business, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  const accessToken = issueBusinessSession(res, business)
  res.json({ success: true, accessToken, business: publicBusiness(business) })
})

// Resend a verification code. Never reveals whether the email is registered
// or already verified — always responds the same way.
export const businessResendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body
  const business = await BusinessUser.findOne({ email }).select('+otpLastSentAt')

  if (business && !business.isVerified && canResendOtp(business)) {
    try {
      await sendVerificationCode(business)
    } catch (err) {
      console.error('Failed to resend business verification email', err)
    }
  }

  res.json({ success: true, message: 'If that account exists, a verification code has been sent.' })
})

// Password-only login (no OTP step, per the Business Portal spec). Blocks
// suspended accounts, and routes unverified accounts back through email
// verification instead of issuing a session.
export const businessLogin = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body

  const business = await BusinessUser.findOne({ email }).select('+passwordHash +otpLastSentAt')
  if (!business) throw new ApiError(401, 'Incorrect email or password.')

  const matches = await bcrypt.compare(password, business.passwordHash)
  if (!matches) throw new ApiError(401, 'Incorrect email or password.')

  if (business.accountStatus === 'suspended') {
    throw new ApiError(403, 'This account has been suspended. Contact Looppr support.')
  }

  if (!business.isVerified) {
    if (canResendOtp(business)) {
      try {
        await sendVerificationCode(business)
      } catch (err) {
        console.error('Failed to send business verification email', err)
      }
    }
    return res.json({ success: true, requiresVerification: true, email: business.email })
  }

  const accessToken = issueBusinessSession(res, business, rememberMe !== false)
  res.json({ success: true, accessToken, business: publicBusiness(business) })
})

export const businessRefresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.businessRefreshToken
  if (!token) throw new ApiError(401, 'Not authenticated.')

  let payload
  try {
    payload = verifyBusinessRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const business = await BusinessUser.findById(payload.sub)
  if (!business) throw new ApiError(401, 'Session expired, please sign in again.')

  // Rejects tokens issued before the last password change/logout-all.
  if (payload.tokenVersion !== business.tokenVersion) {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  // Preserve the original "Remember me" lifetime across refreshes.
  const accessToken = issueBusinessSession(res, business, payload.persistent !== false)
  res.json({ success: true, accessToken, business: publicBusiness(business) })
})

export const businessLogout = asyncHandler(async (_req, res) => {
  res.clearCookie('businessRefreshToken', { path: '/api/business-auth' })
  res.json({ success: true })
})

export const businessMe = asyncHandler(async (req, res) => {
  const business = await BusinessUser.findById(req.business.sub)
  if (!business) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, business: publicBusiness(business) })
})

// Partial profile update from the Settings page. Email/businessType are not
// editable here (email would need re-verification; type is set at signup).
export const businessUpdateMe = asyncHandler(async (req, res) => {
  const business = await BusinessUser.findById(req.business.sub)
  if (!business) throw new ApiError(401, 'Not authenticated.')

  const editable = [
    'businessName',
    'contactPerson',
    'phone',
    'address',
    'city',
    'state',
    'weeklyVolume',
    'registrationNumber',
  ]
  for (const field of editable) {
    if (req.body[field] !== undefined) business[field] = req.body[field]
  }
  await business.save()

  res.json({ success: true, business: publicBusiness(business) })
})

// Step 1 of "forgot password" — always responds the same way regardless of
// whether the email is registered, so it never reveals account existence.
export const businessForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const business = await BusinessUser.findOne({ email }).select('+otpLastSentAt')

  if (business && canResendOtp(business)) {
    const code = await assignOtp(business)
    try {
      await sendPasswordResetEmail(business.email, business.contactPerson, code)
    } catch (err) {
      console.error('Failed to send business password reset email', err)
    }
  }

  res.json({
    success: true,
    message: 'If an account exists for that email, a reset code has been sent.',
  })
})

// Step 2: verify the code, set the new password, invalidate other sessions,
// and sign in directly (email ownership already proven by the code).
export const businessResetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body
  const business = await BusinessUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!business) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(business, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  business.passwordHash = await bcrypt.hash(newPassword, 12)
  business.tokenVersion += 1
  await business.save()

  const accessToken = issueBusinessSession(res, business)
  res.json({ success: true, accessToken, business: publicBusiness(business) })
})
