import mongoose from 'mongoose'
import { ActivityLog } from '../models/ActivityLog.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { publicPartner } from '../utils/session.js'

const ACTIVE_STAGES = ['accepted', 'pickup_completed', 'laundry_in_progress', 'ready_for_delivery']

// Maps a partner action to (partnerStage, customer-facing status). Keeping the
// customer `status` roughly in sync means the customer's order tracking still
// reflects the partner's progress.
const STAGE_MAP = {
  pickup_completed: { stage: 'pickup_completed', status: 'pickup' },
  laundry_in_progress: { stage: 'laundry_in_progress', status: 'laundry_in_progress' },
  ready_for_delivery: { stage: 'ready_for_delivery', status: 'ready_delivered' },
  delivered: { stage: 'delivered', status: 'ready_delivered' },
}

// Resolves a display name for whoever placed the order (account / business /
// guest) so the partner sees a real customer name.
function customerName(p) {
  return p.clientId?.name || p.businessId?.businessName || p.guest?.name || 'Guest'
}

function shapeOrder(p) {
  return {
    _id: p._id,
    customerName: customerName(p),
    address: p.address,
    deliveryAddress: p.deliveryAddress || null,
    loadSize: p.loadSize,
    preferredDate: p.preferredDate,
    window: p.window,
    deliveryWindow: p.deliveryWindow,
    notes: p.notes,
    paymentStatus: p.paymentStatus,
    status: p.status,
    partnerStage: p.partnerStage || null,
    pricing: p.pricing,
    createdAt: p.createdAt,
    partnerAcceptedAt: p.partnerAcceptedAt || null,
  }
}

const WITH_CUSTOMER = [
  { path: 'clientId', select: 'name' },
  { path: 'businessId', select: 'businessName' },
]

// Claimable orders: new, unclaimed, and this partner hasn't rejected them.
export const listIncomingOrders = asyncHandler(async (req, res) => {
  const partnerId = new mongoose.Types.ObjectId(req.partner.sub)
  const pickups = await PickupRequest.find({
    status: 'request_received',
    partnerUserId: null,
    partnerRejectedBy: { $ne: partnerId },
  })
    .sort({ createdAt: -1 })
    .populate(WITH_CUSTOMER)
  res.json({ success: true, orders: pickups.map(shapeOrder) })
})

// All orders this partner has claimed (any stage).
export const listMyOrders = asyncHandler(async (req, res) => {
  const pickups = await PickupRequest.find({ partnerUserId: req.partner.sub })
    .sort({ createdAt: -1 })
    .populate(WITH_CUSTOMER)
  res.json({ success: true, orders: pickups.map(shapeOrder) })
})

export const acceptOrder = asyncHandler(async (req, res) => {
  // Atomic claim — only succeeds if still unclaimed, so two partners can't
  // both accept the same order.
  const pickup = await PickupRequest.findOneAndUpdate(
    { _id: req.params.id, status: 'request_received', partnerUserId: null },
    {
      partnerUserId: req.partner.sub,
      partnerStage: 'accepted',
      partnerAcceptedAt: new Date(),
    },
    { new: true },
  ).populate(WITH_CUSTOMER)

  if (!pickup) throw new ApiError(409, 'This order is no longer available.')

  await ActivityLog.create({
    actorType: 'partner',
    actorId: new mongoose.Types.ObjectId(req.partner.sub),
    action: 'order_accepted',
    entityType: 'PickupRequest',
    entityId: pickup._id,
  }).catch(() => {})

  res.json({ success: true, order: shapeOrder(pickup) })
})

export const rejectOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const partnerId = new mongoose.Types.ObjectId(req.partner.sub)

  const pickup = await PickupRequest.findById(req.params.id)
  if (!pickup) throw new ApiError(404, 'Order not found.')

  // If this partner had claimed it, release it back to the pool; either way,
  // record the rejection so it drops out of their incoming list.
  const update = { $addToSet: { partnerRejectedBy: partnerId } }
  if (pickup.partnerUserId?.toString() === req.partner.sub) {
    update.$set = { partnerUserId: null, partnerStage: undefined, partnerAcceptedAt: undefined }
  }
  await PickupRequest.updateOne({ _id: pickup._id }, update)

  await ActivityLog.create({
    actorType: 'partner',
    actorId: partnerId,
    action: 'order_rejected',
    entityType: 'PickupRequest',
    entityId: pickup._id,
    metadata: { reason },
  }).catch(() => {})

  res.json({ success: true })
})

export const updateOrderStage = asyncHandler(async (req, res) => {
  const { action } = req.body
  const mapping = STAGE_MAP[action]
  if (!mapping) throw new ApiError(422, 'Invalid order action.')

  const pickup = await PickupRequest.findOneAndUpdate(
    { _id: req.params.id, partnerUserId: req.partner.sub },
    { partnerStage: mapping.stage, status: mapping.status },
    { new: true },
  ).populate(WITH_CUSTOMER)

  if (!pickup) throw new ApiError(404, 'Order not found for this partner.')

  await ActivityLog.create({
    actorType: 'partner',
    actorId: new mongoose.Types.ObjectId(req.partner.sub),
    action: `order_${mapping.stage}`,
    entityType: 'PickupRequest',
    entityId: pickup._id,
  }).catch(() => {})

  res.json({ success: true, order: shapeOrder(pickup) })
})

export const getPartnerOverview = asyncHandler(async (req, res) => {
  const partnerId = new mongoose.Types.ObjectId(req.partner.sub)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [newOrders, activeOrders, completedOrders, monthlyRevenueAgg, partner] = await Promise.all([
    PickupRequest.countDocuments({ status: 'request_received', partnerUserId: null, partnerRejectedBy: { $ne: partnerId } }),
    PickupRequest.countDocuments({ partnerUserId: partnerId, partnerStage: { $in: ACTIVE_STAGES } }),
    PickupRequest.countDocuments({ partnerUserId: partnerId, partnerStage: 'delivered' }),
    PickupRequest.aggregate([
      { $match: { partnerUserId: partnerId, paymentStatus: 'paid', paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.amount' } } },
    ]),
    PartnerUser.findById(partnerId).select('averageRating'),
  ])

  res.json({
    success: true,
    overview: {
      newOrders,
      activeOrders,
      completedOrders,
      monthlyRevenue: Math.round((monthlyRevenueAgg[0]?.total || 0) * 100) / 100,
      averageRating: partner?.averageRating ?? null,
    },
  })
})

export const getPartnerEarnings = asyncHandler(async (req, res) => {
  const partnerId = new mongoose.Types.ObjectId(req.partner.sub)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const sumPaid = (match) =>
    PickupRequest.aggregate([
      { $match: { partnerUserId: partnerId, paymentStatus: 'paid', ...match } },
      { $group: { _id: null, total: { $sum: '$pricing.amount' } } },
    ])

  const [totalAgg, weekAgg, monthAgg, pendingAgg] = await Promise.all([
    sumPaid({}),
    sumPaid({ paidAt: { $gte: startOfWeek } }),
    sumPaid({ paidAt: { $gte: startOfMonth } }),
    PickupRequest.aggregate([
      { $match: { partnerUserId: partnerId, paymentStatus: { $in: ['unpaid', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.amount' } } },
    ]),
  ])

  const round = (v) => Math.round((v || 0) * 100) / 100
  const totalRevenue = round(totalAgg[0]?.total)
  res.json({
    success: true,
    earnings: {
      totalRevenue,
      weeklyRevenue: round(weekAgg[0]?.total),
      monthlyRevenue: round(monthAgg[0]?.total),
      pendingPayments: round(pendingAgg[0]?.total),
      // No payout system yet — completed payouts equal collected revenue.
      completedPayouts: totalRevenue,
    },
  })
})

export const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body
  const partner = await PartnerUser.findByIdAndUpdate(
    req.partner.sub,
    { availability },
    { new: true },
  )
  if (!partner) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, partner: publicPartner(partner) })
})

export const updatePartnerProfile = asyncHandler(async (req, res) => {
  const partner = await PartnerUser.findById(req.partner.sub)
  if (!partner) throw new ApiError(401, 'Not authenticated.')

  const editable = [
    'businessName',
    'ownerName',
    'phone',
    'address',
    'city',
    'state',
    'description',
    'yearsInBusiness',
    'employeeCount',
    'maxDailyCapacity',
    'servicesOffered',
    'pickupAvailable',
    'deliveryAvailable',
    'operatingHours',
    'logo',
  ]
  for (const field of editable) {
    if (req.body[field] !== undefined) partner[field] = req.body[field]
  }
  await partner.save()

  res.json({ success: true, partner: publicPartner(partner) })
})
