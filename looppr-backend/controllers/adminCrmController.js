import { BusinessUser } from '../models/BusinessUser.js'
import { PartnerLead } from '../models/PartnerLead.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Kept separate from adminController.js (pickups/customers/stats) and
// adminApplicationsController.js (partner/driver applications) — this is the
// B2B side: marketing-page inquiries (PartnerLead type 'business') and
// self-serve Business Portal accounts (BusinessUser).

export const listBusinessLeads = asyncHandler(async (req, res) => {
  const { status } = req.query
  const match = { type: 'business' }
  if (status === 'open') match.contacted = false
  if (status === 'contacted') match.contacted = true

  const leads = await PartnerLead.find(match).sort({ createdAt: -1 })
  res.json({ success: true, leads })
})

export const markBusinessLeadContacted = asyncHandler(async (req, res) => {
  const lead = await PartnerLead.findOne({ _id: req.params.id, type: 'business' })
  if (!lead) throw new ApiError(404, 'Lead not found.')
  if (lead.contacted) throw new ApiError(409, 'This lead has already been marked contacted.')

  lead.contacted = true
  lead.contactedAt = new Date()
  await lead.save()

  res.json({ success: true, lead })
})

export const listBusinessAccounts = asyncHandler(async (_req, res) => {
  // Same $lookup + $addFields shape as adminController.js's listCustomers,
  // just keyed off businessId instead of clientId.
  const accounts = await BusinessUser.aggregate([
    { $lookup: { from: 'pickuprequests', localField: '_id', foreignField: 'businessId', as: 'pickups' } },
    {
      $addFields: {
        orderCount: { $size: '$pickups' },
        totalSpent: {
          $sum: {
            $map: {
              input: { $filter: { input: '$pickups', cond: { $eq: ['$$this.paymentStatus', 'paid'] } } },
              as: 'p',
              in: '$$p.pricing.amount',
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        businessName: 1,
        businessType: 1,
        contactPerson: 1,
        email: 1,
        phone: 1,
        weeklyVolume: 1,
        accountStatus: 1,
        createdAt: 1,
        orderCount: 1,
        totalSpent: 1,
      },
    },
  ])

  res.json({ success: true, accounts })
})
