import jwt from 'jsonwebtoken'

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
  )
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' },
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

// Short-lived token issued after a correct password check, before the OTP
// step completes. Signed with a dedicated secret so it can never be mistaken
// for (or reused as) a real access token by the auth middleware.
export function signLoginChallenge(user) {
  return jwt.sign(
    { sub: user._id.toString(), purpose: 'login-otp' },
    process.env.JWT_LOGIN_CHALLENGE_SECRET,
    { expiresIn: '10m' },
  )
}

export function verifyLoginChallenge(token) {
  const payload = jwt.verify(token, process.env.JWT_LOGIN_CHALLENGE_SECRET)
  if (payload.purpose !== 'login-otp') throw new Error('Invalid challenge token')
  return payload
}

export function refreshCookieOptions() {
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000
  return {
    httpOnly: true,
    // Frontend (getlooppr.com) and backend (onrender.com) are different
    // sites, not just different ports — SameSite=Lax silently drops the
    // cookie on cross-site fetch/XHR (it only rides along on top-level
    // navigations), which breaks refresh entirely once deployed. None
    // requires Secure, which is unconditional (not NODE_ENV-gated) because
    // browsers also require it locally when SameSite=None — localhost is
    // exempted from the HTTPS requirement itself, so this still works for
    // local dev too.
    secure: true,
    sameSite: 'none',
    maxAge: maxAgeMs,
    path: '/api/auth',
  }
}
