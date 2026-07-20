import mongoose from 'mongoose'
import { PickupRequest } from '../models/PickupRequest.js'
import { geocodeAddress } from '../services/geocodeService.js'
import { logAssignmentOutcome, resolveAssignment } from '../services/assignmentService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { computeOrderPrice } from '../utils/pricing.js'

export const createPickup = asyncHandler(async (req, res) => {
  const { address, preferredDate, window, loadSize, notes, deliveryWindow, deliveryAddress } = req.body

  const priorOrderCount = await PickupRequest.countDocuments({
    clientId: req.user.sub,
    status: { $ne: 'cancelled' },
  })

  const assignment = await resolveAssignment({ address, loadSize, source: 'account' })

  const pickup = await PickupRequest.create({
    clientId: req.user.sub,
    address,
    preferredDate,
    window,
    loadSize,
    notes,
    deliveryWindow,
    deliveryAddress,
    pricing: computeOrderPrice(loadSize, priorOrderCount),
    ...(assignment || {}),
  })

  try {
    const location = await geocodeAddress(address)
    if (location) {
      pickup.location = location
      await pickup.save()
    }
  } catch (err) {
    console.error('Failed to geocode pickup address', err)
  }

  await logAssignmentOutcome(pickup, assignment)

  res.status(201).json({ success: true, pickup })
})

export const listMyPickups = asyncHandler(async (req, res) => {
  const pickups = await PickupRequest.find({ clientId: req.user.sub })
    .sort({ createdAt: -1 })
    // Public-safe fields only — no email/address/license/plate — so the
    // customer can see and identify who's handling their order without
    // exposing the driver's private contact/account details.
    .populate('driverUserId', 'name profilePhoto vehicleType vehicleName averageRating')
  res.json({ success: true, pickups })
})

// Powers the small stats strip on Home.jsx (total orders, total spent).
export const getMyStats = asyncHandler(async (req, res) => {
  const clientId = new mongoose.Types.ObjectId(req.user.sub)

  const [totalOrders, spentAgg] = await Promise.all([
    PickupRequest.countDocuments({ clientId }),
    // Aggregate pipelines don't get Mongoose's automatic string->ObjectId
    // casting the way find()/countDocuments() do, hence the explicit cast
    // above being required here specifically.
    PickupRequest.aggregate([
      { $match: { clientId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.amount' } } },
    ]),
  ])

  res.json({
    success: true,
    stats: { totalOrders, totalSpent: spentAgg[0]?.total || 0 },
  })
})

// Simulated payment confirmation — flips paymentStatus to 'paid' directly.
// This is the seam a real Stripe webhook will replace once API keys are
// available: right now nothing actually verifies money changed hands, it
// just lets the payment UI be built and demoed end to end.
export const payMyOrder = asyncHandler(async (req, res) => {
  const pickup = await PickupRequest.findOne({ _id: req.params.id, clientId: req.user.sub })
  if (!pickup) throw new ApiError(404, 'Order not found.')
  if (pickup.paymentStatus === 'paid') throw new ApiError(409, 'This order has already been paid for.')

  const updated = await PickupRequest.findOneAndUpdate(
    { _id: pickup._id, paymentStatus: { $ne: 'paid' } },
    { paymentStatus: 'paid', paidAt: new Date() },
    { new: true },
  )
  if (!updated) throw new ApiError(409, 'This order has already been paid for.')

  res.json({ success: true, pickup: updated })
})
