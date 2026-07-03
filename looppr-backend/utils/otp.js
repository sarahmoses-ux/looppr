import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export function generateOtpCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export async function hashOtp(code) {
  return bcrypt.hash(code, 10)
}

export async function assignOtp(user) {
  const code = generateOtpCode()
  user.otpHash = await hashOtp(code)
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS)
  user.otpAttempts = 0
  user.otpLastSentAt = new Date()
  await user.save()
  return code
}

export function canResendOtp(user) {
  if (!user.otpLastSentAt) return true
  return Date.now() - user.otpLastSentAt.getTime() > RESEND_COOLDOWN_MS
}

export async function verifyOtpCode(user, code) {
  if (!user.otpHash || !user.otpExpiresAt) {
    return { ok: false, reason: 'No verification code found. Request a new one.' }
  }
  if (user.otpExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: 'This code has expired. Request a new one.' }
  }
  if (user.otpAttempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'Too many incorrect attempts. Request a new code.' }
  }

  const matches = await bcrypt.compare(code, user.otpHash)
  if (!matches) {
    user.otpAttempts += 1
    await user.save()
    return { ok: false, reason: 'Incorrect code. Please try again.' }
  }

  user.isVerified = true
  user.otpHash = undefined
  user.otpExpiresAt = undefined
  user.otpAttempts = 0
  user.otpLastSentAt = undefined
  await user.save()
  return { ok: true }
}
