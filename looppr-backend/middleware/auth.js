import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/tokens.js'

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(new ApiError(401, 'Not authenticated.'))

  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    next(new ApiError(401, 'Session expired.'))
  }
}

// Must run after requireAuth (needs req.user.role from the access token).
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource.'))
    }
    next()
  }
}
