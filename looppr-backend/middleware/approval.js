import { DriverUser } from '../models/DriverUser.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const PENDING_MESSAGE =
  "Thanks for applying to Looppr! Your application is currently being reviewed by our team. We'll notify you via email once a decision has been made."
const REJECTED_MESSAGE = 'Your Looppr application was not approved. Contact support if you believe this is a mistake.'
const SUSPENDED_MESSAGE = 'This account has been suspended. Contact Looppr support.'
const BLOCKED_MESSAGE = 'Your account cannot access the dashboard right now. Contact Looppr support.'

function messageForStatus(accountStatus) {
  if (accountStatus === 'pending') return PENDING_MESSAGE
  if (accountStatus === 'rejected') return REJECTED_MESSAGE
  if (accountStatus === 'suspended') return SUSPENDED_MESSAGE
  return BLOCKED_MESSAGE
}

// Must run after requirePartnerAuth (needs req.partner.sub from the access
// token). Deliberately re-reads accountStatus from the DB on every request
// rather than trusting the JWT payload — access tokens are short-lived but
// not instant, and partnerRefresh only checks tokenVersion, so without this
// live check a partner rejected/suspended mid-session could keep silently
// refreshing valid access tokens. Deny-by-default: only accountStatus ===
// 'active' passes; every other value (including any future one) is blocked,
// not just 'pending'/'rejected'/'suspended'.
export const requireApprovedPartner = asyncHandler(async (req, _res, next) => {
  const partner = await PartnerUser.findById(req.partner.sub).select('accountStatus')
  if (!partner) return next(new ApiError(401, 'Session expired, please sign in again.'))

  if (partner.accountStatus === 'active') return next()
  next(new ApiError(403, messageForStatus(partner.accountStatus), { accountStatus: partner.accountStatus }))
})

// Same rationale as requireApprovedPartner, against DriverUser. Must run
// after requireDriverAuth.
export const requireApprovedDriver = asyncHandler(async (req, _res, next) => {
  const driver = await DriverUser.findById(req.driver.sub).select('accountStatus')
  if (!driver) return next(new ApiError(401, 'Session expired, please sign in again.'))

  if (driver.accountStatus === 'active') return next()
  next(new ApiError(403, messageForStatus(driver.accountStatus), { accountStatus: driver.accountStatus }))
})
