import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { sendOtpEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import {
  refreshCookieOptions,
  signAccessToken,
  signLoginChallenge,
  signRefreshToken,
  verifyLoginChallenge,
  verifyRefreshToken,
} from '../utils/tokens.js'

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
  }
}

function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  res.cookie('refreshToken', refreshToken, refreshCookieOptions())
  return accessToken
}

async function sendLoginOtp(user) {
  const code = await assignOtp(user)
  await sendOtpEmail(user.email, user.name, code)
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(409, 'An account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, phone, passwordHash })

  try {
    const code = await assignOtp(user)
    await sendOtpEmail(user.email, user.name, code)
  } catch (err) {
    console.error('Failed to send verification email', err)
  }

  const accessToken = issueSession(res, user)
  res.status(201).json({ success: true, accessToken, user: publicUser(user) })
})

// Step 1 of login: check the password, then email a fresh OTP instead of
// issuing a session directly. The client must call verifyLoginOtp with the
// returned challengeToken + code to actually complete sign-in.
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) throw new ApiError(401, 'Incorrect email or password.')

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) throw new ApiError(401, 'Incorrect email or password.')

  try {
    await sendLoginOtp(user)
  } catch (err) {
    console.error('Failed to send login verification email', err)
    throw new ApiError(500, 'Could not send a verification code. Please try again.')
  }

  const challengeToken = signLoginChallenge(user)
  res.json({ success: true, requiresOtp: true, challengeToken, email: user.email })
})

// Step 2 of login: verify the OTP tied to a challengeToken from step 1, then
// issue the real session.
export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { challengeToken, code } = req.body
  if (!challengeToken) throw new ApiError(401, 'Session expired, please sign in again.')
  if (!/^\d{6}$/.test(code || '')) throw new ApiError(422, 'Enter the 6-digit code.')

  let payload
  try {
    payload = verifyLoginChallenge(challengeToken)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const user = await User.findById(payload.sub).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!user) throw new ApiError(401, 'Session expired, please sign in again.')

  const result = await verifyOtpCode(user, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  const accessToken = issueSession(res, user)
  res.json({ success: true, accessToken, user: publicUser(user) })
})

// Resend for the login OTP step, keyed off the same challengeToken (the
// user isn't authenticated yet at this point).
export const resendLoginOtp = asyncHandler(async (req, res) => {
  const { challengeToken } = req.body
  if (!challengeToken) throw new ApiError(401, 'Session expired, please sign in again.')

  let payload
  try {
    payload = verifyLoginChallenge(challengeToken)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const user = await User.findById(payload.sub).select('+otpLastSentAt')
  if (!user) throw new ApiError(401, 'Session expired, please sign in again.')

  if (!canResendOtp(user)) {
    throw new ApiError(429, 'Please wait a moment before requesting another code.')
  }

  await sendLoginOtp(user)
  res.json({ success: true, message: 'Verification code sent.' })
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) throw new ApiError(401, 'Not authenticated.')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new ApiError(401, 'Session expired, please sign in again.')

  const accessToken = issueSession(res, user)
  res.json({ success: true, accessToken, user: publicUser(user) })
})

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' })
  res.json({ success: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub)
  if (!user) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, user: publicUser(user) })
})
