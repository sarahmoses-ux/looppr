import { ActivityLog } from '../models/ActivityLog.js'
import { DriverUser } from '../models/DriverUser.js'
import { Payout } from '../models/Payout.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const round = (v) => Math.round((v || 0) * 100) / 100

// Partner payouts are the full order amount (they do the laundering);
// driver payouts are the delivery fee only — mirrors the split already
// used in partnerController.js's getPartnerEarnings / driverController.js's
// getDriverEarnings.
function amountField(payeeType) {
  return payeeType === 'driver' ? '$pricing.deliveryFee' : '$pricing.amount'
}

function payeeMatchField(payeeType) {
  return payeeType === 'driver' ? 'driverUserId' : 'partnerUserId'
}

export const listPayouts = asyncHandler(async (req, res) => {
  const { payeeType, status } = req.query
  const match = {}
  if (['partner', 'driver'].includes(payeeType)) match.payeeType = payeeType
  if (['pending', 'paid'].includes(status)) match.status = status

  const payouts = await Payout.find(match).sort({ createdAt: -1 }).lean()

  const partnerIds = payouts.filter((p) => p.payeeType === 'partner').map((p) => p.payeeId)
  const driverIds = payouts.filter((p) => p.payeeType === 'driver').map((p) => p.payeeId)
  const [partners, drivers] = await Promise.all([
    PartnerUser.find({ _id: { $in: partnerIds } }).select('businessName').lean(),
    DriverUser.find({ _id: { $in: driverIds } }).select('name').lean(),
  ])
  const partnersById = new Map(partners.map((p) => [p._id.toString(), p]))
  const driversById = new Map(drivers.map((d) => [d._id.toString(), d]))

  const enriched = payouts.map((p) => ({
    ...p,
    payeeName:
      p.payeeType === 'partner'
        ? (partnersById.get(p.payeeId.toString())?.businessName ?? 'Unknown partner')
        : (driversById.get(p.payeeId.toString())?.name ?? 'Unknown driver'),
  }))

  res.json({ success: true, payouts: enriched })
})

// Computes the payout amount fresh from paid orders in [periodStart,
// periodEnd] and freezes it into a new pending Payout — doesn't check for
// an overlapping payout already covering this range, since an admin
// re-running a range they already paid is a deliberate correction, not
// something to silently block.
export const generatePayout = asyncHandler(async (req, res) => {
  const { payeeType, payeeId, periodStart, periodEnd } = req.body

  const Model = payeeType === 'driver' ? DriverUser : PartnerUser
  const payee = await Model.findById(payeeId)
  if (!payee) throw new ApiError(404, `${payeeType === 'driver' ? 'Driver' : 'Partner'} not found.`)

  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new ApiError(422, 'Invalid date range.')
  }

  const [agg] = await PickupRequest.aggregate([
    {
      $match: {
        [payeeMatchField(payeeType)]: payee._id,
        paymentStatus: 'paid',
        paidAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: amountField(payeeType) }, count: { $sum: 1 } } },
  ])

  const amount = round(agg?.total)
  const orderCount = agg?.count || 0
  if (orderCount === 0) throw new ApiError(409, 'No paid orders in this date range.')

  const payout = await Payout.create({
    payeeType,
    payeeId: payee._id,
    periodStart: start,
    periodEnd: end,
    amount,
    orderCount,
    createdBy: req.user.sub,
  })

  await ActivityLog.create({
    actorType: 'admin',
    actorId: req.user.sub,
    action: `${payeeType}_payout_created`,
    entityType: payeeType === 'driver' ? 'DriverUser' : 'PartnerUser',
    entityId: payee._id,
    metadata: { amount, orderCount, periodStart: start, periodEnd: end },
  }).catch(() => {})

  res.status(201).json({ success: true, payout })
})

export const markPayoutPaid = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id)
  if (!payout) throw new ApiError(404, 'Payout not found.')
  if (payout.status === 'paid') throw new ApiError(409, 'This payout has already been marked paid.')

  payout.status = 'paid'
  payout.paidAt = new Date()
  await payout.save()

  await ActivityLog.create({
    actorType: 'admin',
    actorId: req.user.sub,
    action: `${payout.payeeType}_payout_paid`,
    entityType: payout.payeeType === 'driver' ? 'DriverUser' : 'PartnerUser',
    entityId: payout.payeeId,
    metadata: { amount: payout.amount, payoutId: payout._id },
  }).catch(() => {})

  res.json({ success: true, payout })
})
