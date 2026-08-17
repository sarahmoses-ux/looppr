import bcrypt from 'bcryptjs'
import { DriverUser } from '../models/DriverUser.js'
import { sendAdminApplicationNotification, sendOtpEmail, sendPasswordResetEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import { issueDriverSession, publicDriver } from '../utils/session.js'
import { verifyDriverRefreshToken } from '../utils/tokens.js'

// Distinct from CLIENT_URL (below, used for CORS origin — see app.js): that
// stays pointed at wherever the web app is being developed locally, while
// this is always the real public site, since it's only ever used to build
// links that get emailed out (and must work for whoever opens the email,
// not just this dev machine).
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173'

async function sendVerificationCode(driver) {
  const code = await assignOtp(driver)
  await sendOtpEmail(driver.email, driver.name, code)
}

function vehicleDetailsLabel(driver) {
  const parts = [driver.vehicleType]
  if (driver.vehicleName) parts.push(`— ${driver.vehicleName}`)
  const label = parts.join(' ')
  return driver.vehiclePlate ? `${label} (plate ${driver.vehiclePlate})` : label
}

// Fired once — for web, the moment a Driver application is email-verified
// (raw registration accepts any address including typos/bots, so notifying
// admins there would just be noise); for mobile (platform: 'mobile'),
// there's no email-verification step at all, so this fires right at
// registration instead. Never blocks the response the applicant sees.
async function notifyAdminOfApplication(driver) {
  try {
    await sendAdminApplicationNotification({
      applicantType: 'Driver',
      fullName: driver.name,
      email: driver.email,
      phone: driver.phone,
      vehicleDetails: vehicleDetailsLabel(driver),
      city: driver.city,
      state: driver.state,
      appliedAt: driver.createdAt,
      reviewUrl: `${PUBLIC_APP_URL}/admin/applications`,
    })
  } catch (err) {
    console.error('Failed to send admin application notification (driver)', err)
  }
}

// Step 1 of onboarding: create the account and email a verification code —
// EXCEPT for platform: 'mobile' (see partnerAuthController.js for the full
// rationale, identical here): the mobile app skips the emailed-code step
// entirely and goes straight to pending-admin-review, so the account is
// created already isVerified and the admin is notified immediately instead
// of waiting on a verify-email call that will never come. Web (no platform
// field sent) is completely unaffected — same two-step flow as before.
export const driverRegister = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    address,
    city,
    state,
    vehicleType,
    vehicleName,
    licenseNumber,
    vehiclePlate,
    profilePhoto,
    platform,
  } = req.body

  const existing = await DriverUser.findOne({ email })
  if (existing) throw new ApiError(409, 'A driver account with that email already exists.')

  const isMobile = platform === 'mobile'
  const passwordHash = await bcrypt.hash(password, 12)
  const driver = await DriverUser.create({
    name,
    email,
    phone,
    passwordHash,
    address,
    city,
    state,
    vehicleType,
    vehicleName,
    licenseNumber,
    vehiclePlate,
    profilePhoto: profilePhoto || '',
    isVerified: isMobile,
  })

  if (isMobile) {
    await notifyAdminOfApplication(driver)
    return res.status(201).json({ success: true, pendingApproval: true, email: driver.email })
  }

  try {
    await sendVerificationCode(driver)
  } catch (err) {
    console.error('Failed to send driver verification email', err)
  }

  res.status(201).json({ success: true, requiresVerification: true, email: driver.email })
})

// Step 2: verify the emailed code, mark verified, then branch on
// accountStatus — see the matching comment in partnerAuthController.js.
export const driverVerifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  const driver = await DriverUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!driver) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(driver, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  if (driver.accountStatus === 'active') {
    const { accessToken, refreshToken } = issueDriverSession(res, driver)
    return res.json({ success: true, accessToken, refreshToken, driver: publicDriver(driver) })
  }
  if (driver.accountStatus === 'pending') {
    await notifyAdminOfApplication(driver)
    return res.json({ success: true, pendingApproval: true, email: driver.email })
  }
  if (driver.accountStatus === 'rejected') {
    return res.json({ success: true, applicationRejected: true, email: driver.email })
  }
  throw new ApiError(403, 'This account cannot sign in right now. Contact Looppr support.')
})

export const driverResendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body
  const driver = await DriverUser.findOne({ email }).select('+otpLastSentAt')

  if (driver && !driver.isVerified && canResendOtp(driver)) {
    try {
      await sendVerificationCode(driver)
    } catch (err) {
      console.error('Failed to resend driver verification email', err)
    }
  }

  res.json({ success: true, message: 'If that account exists, a verification code has been sent.' })
})

// Password-only login (no OTP step). Blocks suspended accounts, routes
// unverified accounts back through email verification.
export const driverLogin = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body

  const driver = await DriverUser.findOne({ email }).select('+passwordHash +otpLastSentAt')
  if (!driver) throw new ApiError(401, 'Incorrect email or password.')

  const matches = await bcrypt.compare(password, driver.passwordHash)
  if (!matches) throw new ApiError(401, 'Incorrect email or password.')

  if (driver.accountStatus === 'suspended') {
    throw new ApiError(403, 'This account has been suspended. Contact Looppr support.')
  }

  if (!driver.isVerified) {
    if (canResendOtp(driver)) {
      try {
        await sendVerificationCode(driver)
      } catch (err) {
        console.error('Failed to send driver verification email', err)
      }
    }
    return res.json({ success: true, requiresVerification: true, email: driver.email })
  }

  // A session is only ever issued to an 'active' account — mirrors the
  // branch in driverVerifyEmail above.
  if (driver.accountStatus === 'pending') {
    return res.json({ success: true, pendingApproval: true, email: driver.email })
  }
  if (driver.accountStatus === 'rejected') {
    return res.json({ success: true, applicationRejected: true, email: driver.email })
  }
  if (driver.accountStatus !== 'active') {
    throw new ApiError(403, 'This account cannot sign in right now. Contact Looppr support.')
  }

  const { accessToken, refreshToken } = issueDriverSession(res, driver, rememberMe !== false)
  res.json({ success: true, accessToken, refreshToken, driver: publicDriver(driver) })
})

export const driverRefresh = asyncHandler(async (req, res) => {
  // Cookie for the web frontend; request body as a fallback for the mobile
  // app, which has no cookie jar and stores/replays this token itself.
  const token = req.cookies?.driverRefreshToken || req.body?.refreshToken
  if (!token) throw new ApiError(401, 'Not authenticated.')

  let payload
  try {
    payload = verifyDriverRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const driver = await DriverUser.findById(payload.sub)
  if (!driver) throw new ApiError(401, 'Session expired, please sign in again.')
  if (payload.tokenVersion !== driver.tokenVersion) {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const { accessToken, refreshToken } = issueDriverSession(res, driver, payload.persistent !== false)
  res.json({ success: true, accessToken, refreshToken, driver: publicDriver(driver) })
})

export const driverLogout = asyncHandler(async (_req, res) => {
  res.clearCookie('driverRefreshToken', { path: '/api/driver-auth' })
  res.json({ success: true })
})

export const driverMe = asyncHandler(async (req, res) => {
  const driver = await DriverUser.findById(req.driver.sub)
  if (!driver) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, driver: publicDriver(driver) })
})

export const driverForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const driver = await DriverUser.findOne({ email }).select('+otpLastSentAt')

  if (driver && canResendOtp(driver)) {
    const code = await assignOtp(driver)
    try {
      await sendPasswordResetEmail(driver.email, driver.name, code)
    } catch (err) {
      console.error('Failed to send driver password reset email', err)
    }
  }

  res.json({
    success: true,
    message: 'If an account exists for that email, a reset code has been sent.',
  })
})

export const driverResetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body
  const driver = await DriverUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!driver) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(driver, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  driver.passwordHash = await bcrypt.hash(newPassword, 12)
  driver.tokenVersion += 1
  await driver.save()

  const { accessToken, refreshToken } = issueDriverSession(res, driver)
  res.json({ success: true, accessToken, refreshToken, driver: publicDriver(driver) })
})
