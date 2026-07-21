import mongoose from 'mongoose'
import { PickupRequest } from '../models/PickupRequest.js'
import { geocodeAddress } from '../services/geocodeService.js'
import { logAssignmentOutcome, resolveAssignment } from '../services/assignmentService.js'
import { createOrReusePaymentIntent } from '../services/paymentService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { computeOrderPrice } from '../utils/pricing.js'
import { stripe } from '../utils/stripeClient.js'

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
    // Charged immediately at booking (see createOrReusePaymentIntent below)
    // rather than waiting on an admin to send a payment request — 'pending'
    // is what unlocks createOrReusePaymentIntent's paymentStatus guard.
    paymentStatus: 'pending',
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

  // Don't fail the booking itself over a Stripe hiccup — the customer can
  // still pay from Orders.jsx afterward (paymentStatus stays 'pending').
  let clientSecret = null
  try {
    const intent = await createOrReusePaymentIntent(pickup)
    clientSecret = intent.client_secret
  } catch (err) {
    console.error('Failed to create PaymentIntent at booking time', err)
  }

  res.status(201).json({ success: true, pickup, clientSecret })
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

// Powers the "Pay now" button on Orders.jsx — creates (or reuses) a Stripe
// PaymentIntent for this order and hands the frontend its clientSecret so it
// can mount a Payment Element and confirm the charge directly.
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const pickup = await PickupRequest.findOne({ _id: req.params.id, clientId: req.user.sub })
  if (!pickup) throw new ApiError(404, 'Order not found.')

  const intent = await createOrReusePaymentIntent(pickup)
  res.json({ success: true, clientSecret: intent.client_secret })
})

// Called by the frontend right after stripe.confirmPayment() resolves, so
// the UI can flip to "paid" immediately instead of waiting on the webhook
// (routes/stripeWebhookRoutes.js) — which remains the authoritative update
// for cases where the customer closes the tab before this fires. Re-checks
// the PaymentIntent with Stripe directly rather than trusting the client.
export const confirmPayment = asyncHandler(async (req, res) => {
  const pickup = await PickupRequest.findOne({ _id: req.params.id, clientId: req.user.sub })
  if (!pickup) throw new ApiError(404, 'Order not found.')
  if (!pickup.stripePaymentIntentId) throw new ApiError(409, 'No payment has been started for this order.')

  const intent = await stripe.paymentIntents.retrieve(pickup.stripePaymentIntentId)
  if (intent.status !== 'succeeded') {
    return res.json({ success: true, pickup })
  }

  const updated = await PickupRequest.findOneAndUpdate(
    { _id: pickup._id, paymentStatus: { $ne: 'paid' } },
    { paymentStatus: 'paid', paidAt: new Date() },
    { new: true },
  ) || pickup

  res.json({ success: true, pickup: updated })
})
