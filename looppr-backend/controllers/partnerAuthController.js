import bcrypt from 'bcryptjs'
import { PartnerUser } from '../models/PartnerUser.js'
import { sendOtpEmail, sendPasswordResetEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import { issuePartnerSession, publicPartner } from '../utils/session.js'
import { verifyPartnerRefreshToken } from '../utils/tokens.js'

async function sendVerificationCode(partner) {
  const code = await assignOtp(partner)
  await sendOtpEmail(partner.email, partner.ownerName, code)
}

// Step 1 of onboarding: create the (unverified) account and email a code.
export const partnerRegister = asyncHandler(async (req, res) => {
  const {
    businessName,
    ownerName,
    email,
    phone,
    password,
    address,
    city,
    state,
    description,
    yearsInBusiness,
    employeeCount,
    maxDailyCapacity,
    servicesOffered,
    pickupAvailable,
    deliveryAvailable,
    operatingHours,
    logo,
    images,
    businessDocument,
  } = req.body

  const existing = await PartnerUser.findOne({ email })
  if (existing) throw new ApiError(409, 'A partner account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)
  const partner = await PartnerUser.create({
    businessName,
    ownerName,
    email,
    phone,
    passwordHash,
    address,
    city,
    state,
    description,
    yearsInBusiness,
    employeeCount,
    maxDailyCapacity,
    servicesOffered,
    pickupAvailable,
    deliveryAvailable,
    operatingHours,
    // Data-URL uploads (MVP — no external bucket yet). Optional.
    logo: logo || '',
    images: Array.isArray(images) ? images : [],
    businessDocument: businessDocument || '',
  })

  try {
    await sendVerificationCode(partner)
  } catch (err) {
    console.error('Failed to send partner verification email', err)
  }

  res.status(201).json({ success: true, requiresVerification: true, email: partner.email })
})

// Step 2: verify the emailed code, mark verified, and sign in.
export const partnerVerifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  const partner = await PartnerUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!partner) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(partner, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  const accessToken = issuePartnerSession(res, partner)
  res.json({ success: true, accessToken, partner: publicPartner(partner) })
})

export const partnerResendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body
  const partner = await PartnerUser.findOne({ email }).select('+otpLastSentAt')

  if (partner && !partner.isVerified && canResendOtp(partner)) {
    try {
      await sendVerificationCode(partner)
    } catch (err) {
      console.error('Failed to resend partner verification email', err)
    }
  }

  res.json({ success: true, message: 'If that account exists, a verification code has been sent.' })
})

// Password-only login (no OTP step). Blocks suspended accounts, routes
// unverified accounts back through email verification.
export const partnerLogin = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body

  const partner = await PartnerUser.findOne({ email }).select('+passwordHash +otpLastSentAt')
  if (!partner) throw new ApiError(401, 'Incorrect email or password.')

  const matches = await bcrypt.compare(password, partner.passwordHash)
  if (!matches) throw new ApiError(401, 'Incorrect email or password.')

  if (partner.accountStatus === 'suspended') {
    throw new ApiError(403, 'This account has been suspended. Contact Looppr support.')
  }

  if (!partner.isVerified) {
    if (canResendOtp(partner)) {
      try {
        await sendVerificationCode(partner)
      } catch (err) {
        console.error('Failed to send partner verification email', err)
      }
    }
    return res.json({ success: true, requiresVerification: true, email: partner.email })
  }

  const accessToken = issuePartnerSession(res, partner, rememberMe !== false)
  res.json({ success: true, accessToken, partner: publicPartner(partner) })
})

export const partnerRefresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.partnerRefreshToken
  if (!token) throw new ApiError(401, 'Not authenticated.')

  let payload
  try {
    payload = verifyPartnerRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const partner = await PartnerUser.findById(payload.sub)
  if (!partner) throw new ApiError(401, 'Session expired, please sign in again.')
  if (payload.tokenVersion !== partner.tokenVersion) {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const accessToken = issuePartnerSession(res, partner, payload.persistent !== false)
  res.json({ success: true, accessToken, partner: publicPartner(partner) })
})

export const partnerLogout = asyncHandler(async (_req, res) => {
  res.clearCookie('partnerRefreshToken', { path: '/api/partner-auth' })
  res.json({ success: true })
})

export const partnerMe = asyncHandler(async (req, res) => {
  const partner = await PartnerUser.findById(req.partner.sub)
  if (!partner) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, partner: publicPartner(partner) })
})

export const partnerForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const partner = await PartnerUser.findOne({ email }).select('+otpLastSentAt')

  if (partner && canResendOtp(partner)) {
    const code = await assignOtp(partner)
    try {
      await sendPasswordResetEmail(partner.email, partner.ownerName, code)
    } catch (err) {
      console.error('Failed to send partner password reset email', err)
    }
  }

  res.json({
    success: true,
    message: 'If an account exists for that email, a reset code has been sent.',
  })
})

export const partnerResetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body
  const partner = await PartnerUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!partner) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(partner, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  partner.passwordHash = await bcrypt.hash(newPassword, 12)
  partner.tokenVersion += 1
  await partner.save()

  const accessToken = issuePartnerSession(res, partner)
  res.json({ success: true, accessToken, partner: publicPartner(partner) })
})
