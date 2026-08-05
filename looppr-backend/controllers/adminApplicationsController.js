import { TERMINAL_STATUSES } from '../constants/orderStatus.js'
import { DriverUser } from '../models/DriverUser.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { publicDriver, publicPartner } from '../utils/session.js'

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Kept separate from adminController.js (pickups/customers/stats) — a
// distinct concern, same pattern as partnerAuthController.js vs
// partnerController.js.

function applyListFilters(query, search, searchFields) {
  const match = query.status ? { accountStatus: query.status } : {}
  return { match, search: (search || '').trim().toLowerCase(), searchFields }
}

function filterBySearch(docs, term, fields) {
  if (!term) return docs
  return docs.filter((doc) => {
    const haystack = fields
      .map((f) => f(doc))
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })
}

export const listPartnerApplications = asyncHandler(async (req, res) => {
  const { match, search, searchFields } = applyListFilters(req.query, req.query.search, [
    (p) => p.businessName,
    (p) => p.ownerName,
    (p) => p.email,
    (p) => p.phone,
    (p) => p.city,
  ])
  let partners = await PartnerUser.find(match).sort({ createdAt: -1 })
  partners = filterBySearch(partners, search, searchFields)

  // PartnerUser has no denormalized load counter (unlike DriverUser's
  // activeDeliveryCount), so derive it here — one aggregate for the whole
  // page instead of a query per row, same shape as adminCrmController.js's
  // listBusinessAccounts.
  const counts = await PickupRequest.aggregate([
    { $match: { partnerUserId: { $in: partners.map((p) => p._id) }, status: { $nin: TERMINAL_STATUSES } } },
    { $group: { _id: '$partnerUserId', count: { $sum: 1 } } },
  ])
  const countByPartnerId = new Map(counts.map((c) => [c._id.toString(), c.count]))

  res.json({
    success: true,
    partners: partners.map((p) => ({
      ...publicPartner(p),
      activeOrderCount: countByPartnerId.get(p._id.toString()) || 0,
    })),
  })
})

export const listDriverApplications = asyncHandler(async (req, res) => {
  const { match, search, searchFields } = applyListFilters(req.query, req.query.search, [
    (d) => d.name,
    (d) => d.email,
    (d) => d.phone,
    (d) => d.city,
  ])
  let drivers = await DriverUser.find(match).sort({ createdAt: -1 })
  drivers = filterBySearch(drivers, search, searchFields)
  res.json({ success: true, drivers: drivers.map(publicDriver) })
})

// Re-fetches and re-checks accountStatus at write time (never trusts a
// stale list the admin UI already has in memory) — race-safe, and stops
// "approve"/"reject" from being replayed on an already-reviewed application.
export const approvePartnerApplication = asyncHandler(async (req, res) => {
  const partner = await PartnerUser.findById(req.params.id)
  if (!partner) throw new ApiError(404, 'Application not found.')
  if (partner.accountStatus !== 'pending') throw new ApiError(409, 'This application has already been reviewed.')

  partner.accountStatus = 'active'
  await partner.save()

  try {
    await sendApplicationApprovedEmail(partner.email, partner.ownerName, 'partner', `${CLIENT_URL}/partners/login`)
  } catch (err) {
    console.error('Failed to send partner approval email', err)
  }

  res.json({ success: true, partner: publicPartner(partner) })
})

export const rejectPartnerApplication = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const partner = await PartnerUser.findById(req.params.id)
  if (!partner) throw new ApiError(404, 'Application not found.')
  if (partner.accountStatus !== 'pending') throw new ApiError(409, 'This application has already been reviewed.')

  partner.accountStatus = 'rejected'
  await partner.save()

  try {
    await sendApplicationRejectedEmail(partner.email, partner.ownerName, reason)
  } catch (err) {
    console.error('Failed to send partner rejection email', err)
  }

  res.json({ success: true, partner: publicPartner(partner) })
})

export const approveDriverApplication = asyncHandler(async (req, res) => {
  const driver = await DriverUser.findById(req.params.id)
  if (!driver) throw new ApiError(404, 'Application not found.')
  if (driver.accountStatus !== 'pending') throw new ApiError(409, 'This application has already been reviewed.')

  driver.accountStatus = 'active'
  await driver.save()

  try {
    await sendApplicationApprovedEmail(driver.email, driver.name, 'driver', `${CLIENT_URL}/drive/login`)
  } catch (err) {
    console.error('Failed to send driver approval email', err)
  }

  res.json({ success: true, driver: publicDriver(driver) })
})

export const rejectDriverApplication = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const driver = await DriverUser.findById(req.params.id)
  if (!driver) throw new ApiError(404, 'Application not found.')
  if (driver.accountStatus !== 'pending') throw new ApiError(409, 'This application has already been reviewed.')

  driver.accountStatus = 'rejected'
  await driver.save()

  try {
    await sendApplicationRejectedEmail(driver.email, driver.name, reason)
  } catch (err) {
    console.error('Failed to send driver rejection email', err)
  }

  res.json({ success: true, driver: publicDriver(driver) })
})

// Suspend/reactivate an already-approved account — deliberately separate from
// approve/reject above, which only ever move a 'pending' application and stay
// untouched here so replaying an approve/reject can't accidentally undo a
// suspension (or vice versa).
export const updatePartnerStatus = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body
  const partner = await PartnerUser.findById(req.params.id)
  if (!partner) throw new ApiError(404, 'Partner not found.')
  if (!['active', 'suspended'].includes(partner.accountStatus)) {
    throw new ApiError(409, 'This account is not yet approved.')
  }

  partner.accountStatus = accountStatus
  await partner.save()

  res.json({ success: true, partner: publicPartner(partner) })
})

export const updateDriverStatus = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body
  const driver = await DriverUser.findById(req.params.id)
  if (!driver) throw new ApiError(404, 'Driver not found.')
  if (!['active', 'suspended'].includes(driver.accountStatus)) {
    throw new ApiError(409, 'This account is not yet approved.')
  }

  driver.accountStatus = accountStatus
  await driver.save()

  res.json({ success: true, driver: publicDriver(driver) })
})
