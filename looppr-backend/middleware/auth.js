import { ApiError } from '../utils/ApiError.js'
import {
  verifyAccessToken,
  verifyBusinessAccessToken,
  verifyDriverAccessToken,
  verifyPartnerAccessToken,
} from '../utils/tokens.js'

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

// Must run after requireRole('admin'). Scopes an admin-only route to a
// subset of admin sub-roles (see ADMIN_ROLES in models/User.js). A missing
// adminRole (any admin account created before this field existed) is
// grandfathered in as super_admin rather than locked out, since there is no
// migration step that backfills it — and super_admin always passes,
// regardless of which sub-roles are listed, so it never needs to be named
// explicitly at the call site.
export function requireAdminRole(...roles) {
  return (req, _res, next) => {
    const adminRole = req.user?.adminRole || 'super_admin'
    if (adminRole === 'super_admin' || roles.includes(adminRole)) return next()
    return next(new ApiError(403, 'You do not have permission to access this resource.'))
  }
}

// Business Portal guard — verifies a *business* access token (signed with the
// dedicated business secret, see utils/tokens.js). A customer/admin token
// fails this verification outright, so it can never reach a business route.
// Sets req.business (not req.user) to keep the two auth worlds cleanly apart.
export function requireBusinessAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(new ApiError(401, 'Not authenticated.'))

  try {
    req.business = verifyBusinessAccessToken(token)
    next()
  } catch {
    next(new ApiError(401, 'Session expired.'))
  }
}

// Partner Portal guard — verifies a *partner* access token (dedicated
// secret). Customer/admin/business tokens fail this outright. Sets
// req.partner to keep the auth worlds cleanly apart.
export function requirePartnerAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(new ApiError(401, 'Not authenticated.'))

  try {
    req.partner = verifyPartnerAccessToken(token)
    next()
  } catch {
    next(new ApiError(401, 'Session expired.'))
  }
}

// Driver Portal guard — verifies a *driver* access token (dedicated secret).
// Customer/admin/business/partner tokens fail this outright. Sets
// req.driver to keep the auth worlds cleanly apart.
export function requireDriverAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(new ApiError(401, 'Not authenticated.'))

  try {
    req.driver = verifyDriverAccessToken(token)
    next()
  } catch {
    next(new ApiError(401, 'Session expired.'))
  }
}
