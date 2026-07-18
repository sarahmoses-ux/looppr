import bcrypt from 'bcryptjs'
import { DriverUser } from '../models/DriverUser.js'
import { sendOtpEmail, sendPasswordResetEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import { issueDriverSession, publicDriver } from '../utils/session.js'
import { verifyDriverRefreshToken } from '../utils/tokens.js'

async function sendVerificationCode(driver) {
  const code = await assignOtp(driver)
  await sendOtpEmail(driver.email, driver.name, code)
}

// Step 1 of onboarding: create the (unverified) account and email a code.
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
  } = req.body

  const existing = await DriverUser.findOne({ email })
  if (existing) throw new ApiError(409, 'A driver account with that email already exists.')

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
  })

  try {
    await sendVerificationCode(driver)
  } catch (err) {
    console.error('Failed to send driver verification email', err)
  }

  res.status(201).json({ success: true, requiresVerification: true, email: driver.email })
})

// Step 2: verify the emailed code, mark verified, and sign in.
export const driverVerifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  const driver = await DriverUser.findOne({ email }).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!driver) throw new ApiError(400, 'Invalid or expired code.')

  const result = await verifyOtpCode(driver, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  const accessToken = issueDriverSession(res, driver)
  res.json({ success: true, accessToken, driver: publicDriver(driver) })
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

  const accessToken = issueDriverSession(res, driver, rememberMe !== false)
  res.json({ success: true, accessToken, driver: publicDriver(driver) })
})

export const driverRefresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.driverRefreshToken
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

  const accessToken = issueDriverSession(res, driver, payload.persistent !== false)
  res.json({ success: true, accessToken, driver: publicDriver(driver) })
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

  const accessToken = issueDriverSession(res, driver)
  res.json({ success: true, accessToken, driver: publicDriver(driver) })
})
