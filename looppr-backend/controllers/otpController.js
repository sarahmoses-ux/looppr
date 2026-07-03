import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assignOtp, canResendOtp, verifyOtpCode } from '../utils/otp.js'
import { sendOtpEmail } from '../services/emailService.js'

export const sendOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!user) throw new ApiError(401, 'Not authenticated.')
  if (user.isVerified) throw new ApiError(409, 'This account is already verified.')

  if (!canResendOtp(user)) {
    throw new ApiError(429, 'Please wait a moment before requesting another code.')
  }

  const code = await assignOtp(user)
  await sendOtpEmail(user.email, user.name, code)

  res.json({ success: true, message: 'Verification code sent.' })
})

export const verifyOtp = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!/^\d{6}$/.test(code || '')) throw new ApiError(422, 'Enter the 6-digit code.')

  const user = await User.findById(req.user.sub).select(
    '+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt',
  )
  if (!user) throw new ApiError(401, 'Not authenticated.')
  if (user.isVerified) throw new ApiError(409, 'This account is already verified.')

  const result = await verifyOtpCode(user, code)
  if (!result.ok) throw new ApiError(400, result.reason)

  res.json({
    success: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
  })
})
