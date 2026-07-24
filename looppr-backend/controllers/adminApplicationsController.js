import { DriverUser } from '../models/DriverUser.js'
import { PartnerUser } from '../models/PartnerUser.js'
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
  res.json({ success: true, partners: partners.map(publicPartner) })
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
