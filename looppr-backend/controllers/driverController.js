import mongoose from 'mongoose'
import { ActivityLog } from '../models/ActivityLog.js'
import { DriverUser } from '../models/DriverUser.js'
import { Payout } from '../models/Payout.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { notifyPickupOwner } from '../services/notificationService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recomputeSubtotalForWeight } from '../utils/pricing.js'
import { publicDriver } from '../utils/session.js'

const ACTIVE_STAGES = ['assigned', 'pickup_completed', 'at_laundromat', 'out_for_delivery']

// Maps a driver action to (driverStage, customer-facing status). Only
// pickup_completed/delivered move the shared 4-stage `status` — the
// intermediate at_laundromat/out_for_delivery stages are driver-internal
// detail and deliberately don't collide with the Partner Portal's own writes
// to `status` (laundry_in_progress/ready_for_delivery are the partner's to
// set), keeping the two claim systems decoupled.
const STAGE_MAP = {
  pickup_completed: { stage: 'pickup_completed', status: 'pickup' },
  at_laundromat: { stage: 'at_laundromat' },
  out_for_delivery: { stage: 'out_for_delivery' },
  delivered: { stage: 'delivered', status: 'ready_delivered' },
}

// Customer-facing copy for each driver action that's worth notifying about
// -- at_laundromat is internal detail, not shown to the customer.
const CUSTOMER_MESSAGE = {
  pickup_completed: 'Your driver has picked up your laundry.',
  out_for_delivery: 'Your laundry is out for delivery.',
  delivered: 'Your laundry has been delivered.',
}

function customerName(p) {
  return p.clientId?.name || p.businessId?.businessName || p.guest?.name || 'Guest'
}

function shapeDelivery(p) {
  return {
    _id: p._id,
    customerName: customerName(p),
    address: p.address,
    deliveryAddress: p.deliveryAddress || null,
    location: p.location || null,
    loadSize: p.loadSize,
    shoeLaundry: p.shoeLaundry,
    // Driver-confirmed weight, when set, is authoritative over loadSize —
    // frontend should prefer this for display.
    actualWeightLbs: p.actualWeightLbs ?? null,
    weightConfirmedAt: p.weightConfirmedAt || null,
    preferredDate: p.preferredDate,
    window: p.window,
    deliveryWindow: p.deliveryWindow,
    notes: p.notes,
    paymentStatus: p.paymentStatus,
    status: p.status,
    driverStage: p.driverStage || null,
    pricing: p.pricing,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    driverAcceptedAt: p.driverAcceptedAt || null,
  }
}

const WITH_CUSTOMER = [
  { path: 'clientId', select: 'name' },
  { path: 'businessId', select: 'businessName' },
]

// Claimable deliveries: new, unclaimed, and this driver hasn't rejected them.
export const listIncomingDeliveries = asyncHandler(async (req, res) => {
  const driverId = new mongoose.Types.ObjectId(req.driver.sub)
  const pickups = await PickupRequest.find({
    status: 'request_received',
    driverUserId: null,
    driverRejectedBy: { $ne: driverId },
  })
    .sort({ createdAt: -1 })
    .populate(WITH_CUSTOMER)
  res.json({ success: true, deliveries: pickups.map(shapeDelivery) })
})

// All deliveries this driver has claimed (any stage).
export const listMyDeliveries = asyncHandler(async (req, res) => {
  const pickups = await PickupRequest.find({ driverUserId: req.driver.sub })
    .sort({ createdAt: -1 })
    .populate(WITH_CUSTOMER)
  res.json({ success: true, deliveries: pickups.map(shapeDelivery) })
})

export const acceptDelivery = asyncHandler(async (req, res) => {
  // Atomic claim — only succeeds if still unclaimed, so two drivers can't
  // both accept the same delivery.
  const pickup = await PickupRequest.findOneAndUpdate(
    { _id: req.params.id, status: 'request_received', driverUserId: null },
    {
      driverUserId: req.driver.sub,
      driverStage: 'assigned',
      driverAcceptedAt: new Date(),
    },
    { new: true },
  ).populate(WITH_CUSTOMER)

  if (!pickup) throw new ApiError(409, 'This delivery is no longer available.')

  await DriverUser.findByIdAndUpdate(req.driver.sub, { $inc: { activeDeliveryCount: 1 } }).catch(() => {})

  await ActivityLog.create({
    actorType: 'rider',
    actorId: new mongoose.Types.ObjectId(req.driver.sub),
    action: 'delivery_accepted',
    entityType: 'PickupRequest',
    entityId: pickup._id,
  }).catch(() => {})

  await notifyPickupOwner(pickup, {
    title: 'Driver assigned',
    body: 'A driver has been assigned to your order.',
    type: 'driver_assigned',
    data: { pickupId: pickup._id.toString() },
  })

  res.json({ success: true, delivery: shapeDelivery(pickup) })
})

export const rejectDelivery = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const driverId = new mongoose.Types.ObjectId(req.driver.sub)

  const pickup = await PickupRequest.findById(req.params.id)
  if (!pickup) throw new ApiError(404, 'Delivery not found.')

  const wasMine = pickup.driverUserId?.toString() === req.driver.sub
  const update = { $addToSet: { driverRejectedBy: driverId } }
  if (wasMine) {
    update.$set = { driverUserId: null, driverStage: undefined, driverAcceptedAt: undefined }
  }
  await PickupRequest.updateOne({ _id: pickup._id }, update)

  if (wasMine) {
    await DriverUser.findByIdAndUpdate(req.driver.sub, { $inc: { activeDeliveryCount: -1 } }).catch(() => {})
  }

  await ActivityLog.create({
    actorType: 'rider',
    actorId: driverId,
    action: 'delivery_rejected',
    entityType: 'PickupRequest',
    entityId: pickup._id,
    metadata: { reason },
  }).catch(() => {})

  res.json({ success: true })
})

export const updateDeliveryStage = asyncHandler(async (req, res) => {
  const { action } = req.body
  const mapping = STAGE_MAP[action]
  if (!mapping) throw new ApiError(422, 'Invalid delivery action.')

  const update = { driverStage: mapping.stage }
  if (mapping.status) update.status = mapping.status

  const pickup = await PickupRequest.findOneAndUpdate(
    { _id: req.params.id, driverUserId: req.driver.sub },
    update,
    { new: true },
  ).populate(WITH_CUSTOMER)

  if (!pickup) throw new ApiError(404, 'Delivery not found for this driver.')

  if (mapping.stage === 'delivered') {
    await DriverUser.findByIdAndUpdate(req.driver.sub, { $inc: { activeDeliveryCount: -1 } }).catch(() => {})
  }

  await ActivityLog.create({
    actorType: 'rider',
    actorId: new mongoose.Types.ObjectId(req.driver.sub),
    action: `delivery_${mapping.stage}`,
    entityType: 'PickupRequest',
    entityId: pickup._id,
  }).catch(() => {})

  if (CUSTOMER_MESSAGE[action]) {
    await notifyPickupOwner(pickup, {
      title: 'Order update',
      body: CUSTOMER_MESSAGE[action],
      type: `delivery_${mapping.stage}`,
      data: { pickupId: pickup._id.toString() },
    })
  }

  res.json({ success: true, delivery: shapeDelivery(pickup) })
})

// Lets the claiming driver update or confirm the actual pounds at pickup —
// corrects a customer/business mistake in the original loadSize estimate.
// The confirmed weight is authoritative going forward (shapeDelivery prefers
// it over loadSize for display). Also re-prices the subtotal/amount from the
// corrected weight — but only while the order hasn't been paid yet, so a
// driver's correction never silently changes an amount the customer already
// paid; deliveryFee is left untouched (it reflects the customer's own promo
// eligibility from booking time, unrelated to a weight correction).
export const confirmWeight = asyncHandler(async (req, res) => {
  const { actualWeightLbs, weighInPhoto } = req.body

  const pickup = await PickupRequest.findOne({ _id: req.params.id, driverUserId: req.driver.sub })
  if (!pickup) throw new ApiError(404, 'Delivery not found for this driver.')

  pickup.actualWeightLbs = actualWeightLbs
  pickup.weightConfirmedAt = new Date()
  pickup.weightConfirmedBy = req.driver.sub
  if (weighInPhoto) pickup.weighInPhoto = weighInPhoto

  if (pickup.paymentStatus !== 'paid') {
    const { amount, subtotal } = recomputeSubtotalForWeight(
      actualWeightLbs,
      pickup.pricing?.deliveryFee || 0,
      pickup.pricing?.shoeLaundrySubtotal || 0,
    )
    pickup.pricing.amount = amount
    pickup.pricing.subtotal = subtotal
  }

  await pickup.save()
  await pickup.populate(WITH_CUSTOMER)

  await ActivityLog.create({
    actorType: 'rider',
    actorId: new mongoose.Types.ObjectId(req.driver.sub),
    action: 'delivery_weight_confirmed',
    entityType: 'PickupRequest',
    entityId: pickup._id,
    metadata: { loadSize: pickup.loadSize, actualWeightLbs },
  }).catch(() => {})

  res.json({ success: true, delivery: shapeDelivery(pickup) })
})

export const getDriverOverview = asyncHandler(async (req, res) => {
  const driverId = new mongoose.Types.ObjectId(req.driver.sub)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [newDeliveries, activeDeliveries, completedDeliveries, monthlyEarningsAgg, driver] = await Promise.all([
    PickupRequest.countDocuments({ status: 'request_received', driverUserId: null, driverRejectedBy: { $ne: driverId } }),
    PickupRequest.countDocuments({ driverUserId: driverId, driverStage: { $in: ACTIVE_STAGES } }),
    PickupRequest.countDocuments({ driverUserId: driverId, driverStage: 'delivered' }),
    PickupRequest.aggregate([
      { $match: { driverUserId: driverId, paymentStatus: 'paid', paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.deliveryFee' } } },
    ]),
    DriverUser.findById(driverId).select('averageRating availability'),
  ])

  res.json({
    success: true,
    overview: {
      newDeliveries,
      activeDeliveries,
      completedDeliveries,
      monthlyEarnings: Math.round((monthlyEarningsAgg[0]?.total || 0) * 100) / 100,
      averageRating: driver?.averageRating ?? null,
      availability: driver?.availability ?? 'offline',
    },
  })
})

// Driver earnings come from the delivery fee only (not the wash cost) — a
// driver handles pickup/delivery, not laundering, so their revenue share is
// pricing.deliveryFee on paid orders they delivered.
export const getDriverEarnings = asyncHandler(async (req, res) => {
  const driverId = new mongoose.Types.ObjectId(req.driver.sub)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const sumFee = (match) =>
    PickupRequest.aggregate([
      { $match: { driverUserId: driverId, paymentStatus: 'paid', ...match } },
      { $group: { _id: null, total: { $sum: '$pricing.deliveryFee' } } },
    ])

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const [totalAgg, weekAgg, monthAgg, pendingAgg, paidOutAgg, todayDeliveries] = await Promise.all([
    sumFee({}),
    sumFee({ paidAt: { $gte: startOfWeek } }),
    sumFee({ paidAt: { $gte: startOfMonth } }),
    PickupRequest.aggregate([
      { $match: { driverUserId: driverId, paymentStatus: { $in: ['unpaid', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.deliveryFee' } } },
    ]),
    Payout.aggregate([
      { $match: { payeeType: 'driver', payeeId: driverId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // "Today's shift" — no dedicated deliveredAt field, so this uses
    // updatedAt at driverStage 'delivered' as the completion time, the same
    // convention businessController.js's avgProcessingHours already uses.
    PickupRequest.find({ driverUserId: driverId, driverStage: 'delivered', updatedAt: { $gte: startOfToday } })
      .select('address pricing.deliveryFee updatedAt')
      .sort({ updatedAt: -1 }),
  ])

  const round = (v) => Math.round((v || 0) * 100) / 100
  res.json({
    success: true,
    earnings: {
      totalEarnings: round(totalAgg[0]?.total),
      weeklyEarnings: round(weekAgg[0]?.total),
      monthlyEarnings: round(monthAgg[0]?.total),
      pendingPayments: round(pendingAgg[0]?.total),
      // Real payouts an admin has generated and marked paid — see
      // adminPayoutsController.js. Distinct from collected fees above: a
      // driver can have plenty of paid deliveries with no payout issued yet.
      completedPayouts: round(paidOutAgg[0]?.total),
      today: {
        total: round(todayDeliveries.reduce((sum, d) => sum + (d.pricing?.deliveryFee || 0), 0)),
        deliveries: todayDeliveries.map((d) => ({
          _id: d._id,
          street: d.address?.street,
          fee: d.pricing?.deliveryFee,
          deliveredAt: d.updatedAt,
        })),
      },
    },
  })
})

// Payout history for this driver — the same Payout records an admin
// generates via adminPayoutsController.js, filtered to their own payouts.
export const listMyPayouts = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({ payeeType: 'driver', payeeId: req.driver.sub }).sort({ periodStart: -1 })
  res.json({ success: true, payouts })
})

// 'online' maps to DriverUser.availability's 'available' state (the enum also
// has 'on_delivery', which the driver doesn't set directly — the assignment
// engine will own that transition once it exists).
export const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body
  const stored = availability === 'online' ? 'available' : 'offline'
  const driver = await DriverUser.findByIdAndUpdate(req.driver.sub, { availability: stored }, { new: true })
  if (!driver) throw new ApiError(401, 'Not authenticated.')

  await ActivityLog.create({
    actorType: 'rider',
    actorId: driver._id,
    action: 'driver_availability_changed',
    entityType: 'DriverUser',
    entityId: driver._id,
    metadata: { availability: stored },
  }).catch(() => {})

  res.json({ success: true, driver: publicDriver(driver) })
})

export const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body
  const driver = await DriverUser.findByIdAndUpdate(
    req.driver.sub,
    {
      location: { type: 'Point', coordinates: [lng, lat] },
      locationUpdatedAt: new Date(),
    },
    { new: true },
  )
  if (!driver) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, driver: publicDriver(driver) })
})

export const updateDriverProfile = asyncHandler(async (req, res) => {
  const driver = await DriverUser.findById(req.driver.sub)
  if (!driver) throw new ApiError(401, 'Not authenticated.')

  const editable = ['name', 'phone', 'address', 'city', 'state', 'vehicleType', 'vehicleName', 'licenseNumber', 'vehiclePlate', 'profilePhoto']
  // Diffed before assignment (not just "field present in body") so a no-op
  // save (form re-submitted with identical values) doesn't log noise.
  const changedFields = editable.filter(
    (field) => req.body[field] !== undefined && JSON.stringify(req.body[field]) !== JSON.stringify(driver[field]),
  )
  for (const field of editable) {
    if (req.body[field] !== undefined) driver[field] = req.body[field]
  }
  await driver.save()

  if (changedFields.length > 0) {
    await ActivityLog.create({
      actorType: 'rider',
      actorId: driver._id,
      action: 'driver_profile_updated',
      entityType: 'DriverUser',
      entityId: driver._id,
      metadata: { changedFields },
    }).catch(() => {})
  }

  res.json({ success: true, driver: publicDriver(driver) })
})
