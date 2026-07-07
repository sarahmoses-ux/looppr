import { refreshCookieOptions, signAccessToken, signRefreshToken } from './tokens.js'

// Used by every authController endpoint that issues a session
// (register/login/refresh) — one place that knows how a session is built.
export function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  res.cookie('refreshToken', refreshToken, refreshCookieOptions())
  return accessToken
}

export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    emailNotifications: user.emailNotifications,
    createdAt: user.createdAt,
  }
}
