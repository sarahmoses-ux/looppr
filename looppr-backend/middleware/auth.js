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
