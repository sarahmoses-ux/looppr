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

// ---------------------------------------------------------------------------
// Business Portal tokens — signed with DEDICATED secrets so a business token
// can never be verified (and therefore accepted) by the customer/admin auth
// middleware, and vice versa. This is what actually enforces "business users
// can only log into the Business Portal": token isolation, not just role
// checks. Secrets fall back to the main ones only if unset, so local dev
// works out of the box, but production must set distinct values.
// ---------------------------------------------------------------------------
function businessAccessSecret() {
  return process.env.JWT_BUSINESS_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET
}

function businessRefreshSecret() {
  return process.env.JWT_BUSINESS_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET
}

export function signBusinessAccessToken(business) {
  return jwt.sign(
    { sub: business._id.toString(), role: business.role, tokenVersion: business.tokenVersion },
    businessAccessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
  )
}

export function signBusinessRefreshToken(business, persistent = true) {
  return jwt.sign(
    // `persistent` (the login "Remember me" choice) rides in the token so a
    // refresh can re-issue the cookie with the same lifetime — otherwise a
    // mid-session refresh would silently upgrade a "session only" login to a
    // persistent one.
    { sub: business._id.toString(), role: business.role, tokenVersion: business.tokenVersion, persistent },
    businessRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' },
  )
}

export function verifyBusinessAccessToken(token) {
  return jwt.verify(token, businessAccessSecret())
}

export function verifyBusinessRefreshToken(token) {
  return jwt.verify(token, businessRefreshSecret())
}

// Distinct cookie name AND path from the customer/admin refresh cookie
// (`refreshToken` on `/api/auth`) so both can coexist in one browser without
// overwriting each other — a user could be signed into the customer app and
// the Business Portal in the same session with no interference.
//   persistent=false ("Remember me" unchecked) → session cookie, cleared when
//   the browser closes; persistent=true → 30-day cookie.
export function businessRefreshCookieOptions(persistent = true) {
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000
  return {
    httpOnly: true,
    // See refreshCookieOptions below for why SameSite=None + Secure is
    // required (cross-site frontend/backend on deploy, localhost-exempt).
    secure: true,
    sameSite: 'none',
    ...(persistent ? { maxAge: maxAgeMs } : {}),
    path: '/api/business-auth',
  }
}

// ---------------------------------------------------------------------------
// Partner Portal tokens — dedicated secrets, same isolation rationale as the
// business tokens above: a partner token can't be verified by the customer/
// admin/business middleware, and vice versa. Falls back to the main secrets
// if unset so local dev runs out of the box.
// ---------------------------------------------------------------------------
function partnerAccessSecret() {
  return process.env.JWT_PARTNER_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET
}

function partnerRefreshSecret() {
  return process.env.JWT_PARTNER_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET
}

export function signPartnerAccessToken(partner) {
  return jwt.sign(
    { sub: partner._id.toString(), role: partner.role, tokenVersion: partner.tokenVersion },
    partnerAccessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
  )
}

export function signPartnerRefreshToken(partner, persistent = true) {
  return jwt.sign(
    { sub: partner._id.toString(), role: partner.role, tokenVersion: partner.tokenVersion, persistent },
    partnerRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' },
  )
}

export function verifyPartnerAccessToken(token) {
  return jwt.verify(token, partnerAccessSecret())
}

export function verifyPartnerRefreshToken(token) {
  return jwt.verify(token, partnerRefreshSecret())
}

// Own cookie name + path (`/api/partner-auth`) so partner, business and
// customer sessions never overwrite each other in one browser.
export function partnerRefreshCookieOptions(persistent = true) {
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    ...(persistent ? { maxAge: maxAgeMs } : {}),
    path: '/api/partner-auth',
  }
}

// ---------------------------------------------------------------------------
// Driver Portal tokens — dedicated secrets, same isolation rationale as the
// business/partner tokens above. Falls back to the main secrets if unset so
// local dev runs out of the box.
// ---------------------------------------------------------------------------
function driverAccessSecret() {
  return process.env.JWT_DRIVER_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET
}

function driverRefreshSecret() {
  return process.env.JWT_DRIVER_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET
}

export function signDriverAccessToken(driver) {
  return jwt.sign(
    { sub: driver._id.toString(), role: driver.role, tokenVersion: driver.tokenVersion },
    driverAccessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
  )
}

export function signDriverRefreshToken(driver, persistent = true) {
  return jwt.sign(
    { sub: driver._id.toString(), role: driver.role, tokenVersion: driver.tokenVersion, persistent },
    driverRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' },
  )
}

export function verifyDriverAccessToken(token) {
  return jwt.verify(token, driverAccessSecret())
}

export function verifyDriverRefreshToken(token) {
  return jwt.verify(token, driverRefreshSecret())
}

// Own cookie name + path (`/api/driver-auth`) so driver, partner, business
// and customer sessions never overwrite each other in one browser.
export function driverRefreshCookieOptions(persistent = true) {
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    ...(persistent ? { maxAge: maxAgeMs } : {}),
    path: '/api/driver-auth',
  }
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
