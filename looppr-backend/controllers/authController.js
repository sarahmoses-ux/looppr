import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { sendOtpEmail, sendPasswordResetEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import { issueSession, publicUser } from '../utils/session.js'
import {
  signLoginChallenge,
  verifyLoginChallenge,
  verifyRefreshToken,
} from '../utils/tokens.js'

async function sendLoginOtp(user) {
  const code = await assignOtp(user)
  await sendOtpEmail(user.email, user.name, code)
}

// Shared by the client and admin login endpoints. `requiredRole` scopes the
// lookup so a client account can never authenticate on the admin surface
// (or vice versa) — the error is identical either way so it never reveals
// which part failed or whether the email exists under a different role.
async function passwordCheck(email, password, requiredRole) {
  const user = await User.findOne({ email, role: requiredRole }).select('+passwordHash')
  if (!user) throw new ApiError(401, 'Incorrect email or password.')

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) throw new ApiError(401, 'Incorrect email or password.')

  return user
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
  const user = await passwordCheck(email, password, 'client')

  try {
    await sendLoginOtp(user)
  } catch (err) {
    console.error('Failed to send login verification email', err)
    throw new ApiError(500, 'Could not send a verification code. Please try again.')
  }

  const challengeToken = signLoginChallenge(user)
  res.json({ success: true, requiresOtp: true, challengeToken, email: user.email })
})

// Admin sign-in — identical flow to the customer login above (password
// check, then emailed OTP, then a challengeToken for verifyLoginOtp/
// resendLoginOtp), but scoped to role: 'admin'. There is no adminRegister:
// admin accounts are only created via scripts/seedAdmin.js.
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await passwordCheck(email, password, 'admin')

  try {
    await sendLoginOtp(user)
  } catch (err) {
    console.error('Failed to send admin login verification email', err)
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

  // Rejects refresh tokens issued before the user's last password change/
  // reset (see changePassword/resetPassword, which bump tokenVersion) —
  // this is what actually revokes a stolen or old session, since access
  // tokens themselves aren't checked against this on every request.
  if (payload.tokenVersion !== user.tokenVersion) {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

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

// Partial update — Profile.jsx sends { name, phone }, Settings.jsx sends
// { emailNotifications }. Email is deliberately not editable here: changing
// it would need its own re-verification flow, which doesn't exist yet.
export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, emailNotifications } = req.body
  const user = await User.findById(req.user.sub)
  if (!user) throw new ApiError(401, 'Not authenticated.')

  if (name !== undefined) user.name = name
  if (phone !== undefined) user.phone = phone
  if (emailNotifications !== undefined) user.emailNotifications = emailNotifications
  await user.save()

  res.json({ success: true, user: publicUser(user) })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.sub).select('+passwordHash')
  if (!user) throw new ApiError(401, 'Not authenticated.')

  const matches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!matches) throw new ApiError(401, 'Current password is incorrect.')

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  // Invalidates every other refresh token issued before this point (see
  // refresh's tokenVersion check) — then immediately re-issues one on the
  // new version so the caller's own session keeps working.
  user.tokenVersion += 1
  await user.save()

  const accessToken = issueSession(res, user)
  res.json({ success: true, accessToken })
})

// Step 1 of the "forgot password" flow. Always responds the same way
// whether or not the email is registered — never reveals account
// existence. Scoped to role: 'client' (admin password recovery is
// deliberately out of band, via direct DB/seed-script access).
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email, role: 'client' }).select('+otpLastSentAt')

  if (user && canResendOtp(user)) {
    const code = await assignOtp(user)
    try {
      await sendPasswordResetEmail(user.email, user.name, code)
    } catch (err) {
      console.error('Failed to send password reset email', err)
    }
  }

  res.json({
    success: true,
    message: 'If an account exists for that email, a reset code has been sent.',
  })
})

// Step 2: verify the code, set the new password, and sign the user
// straight in (they've already proven email ownership via the code, no
// need to make them log in again separately).
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body
  const user = await User.findOne({ email, role: 'client' }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!user) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(user, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  // Same reasoning as changePassword — see refresh's tokenVersion check.
  user.tokenVersion += 1
  await user.save()

  const accessToken = issueSession(res, user)
  res.json({ success: true, accessToken, user: publicUser(user) })
})
