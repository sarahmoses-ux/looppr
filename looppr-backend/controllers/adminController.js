import { ALL_STATUSES, TERMINAL_STATUSES } from '../constants/orderStatus.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { User } from '../models/User.js'
import { sendPaymentRequestEmail } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listAllPickups = asyncHandler(async (req, res) => {
  const { status, paymentStatus, search } = req.query
  const match = {}
  if (status) match.status = status
  if (paymentStatus) match.paymentStatus = paymentStatus

  let pickups = await PickupRequest.find(match)
    .sort({ createdAt: -1 })
    .populate('clientId', 'name email phone emailNotifications')
    // Surface the Partner Portal claim so admins see which laundromat took
    // the order and how far along it is (partnerStage), reflecting any
    // accept/advance/reject action a partner took.
    .populate('partnerUserId', 'businessName ownerName')
    // Same for the Driver Portal — which driver claimed the delivery, its
    // stage, and any actualWeightLbs correction they made at pickup.
    .populate('driverUserId', 'name')

  // Filtered in application code rather than a $lookup aggregation — simpler
  // to read/maintain, and fine at MVP order volumes. Revisit with a Mongo
  // text index / aggregation if this list ever gets large.
  if (search) {
    const term = search.trim().toLowerCase()
    pickups = pickups.filter((p) => {
      const haystack = [
        p.guest?.name,
        p.guest?.email,
        p.guest?.phone,
        p.clientId?.name,
        p.clientId?.email,
        p.clientId?.phone,
        p.address?.street,
        p.address?.city,
        p.address?.zip,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }

  res.json({ success: true, pickups })
})

export const listCustomers = asyncHandler(async (_req, res) => {
  // $lookup instead of a second query per customer — one round trip
  // regardless of customer count, matching the "cheap at MVP scale, revisit
  // if this grows" approach already used in listAllPickups' search filter.
  const customers = await User.aggregate([
    { $match: { role: 'client' } },
    { $lookup: { from: 'pickuprequests', localField: '_id', foreignField: 'clientId', as: 'pickups' } },
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
    { $project: { name: 1, email: 1, phone: 1, isVerified: 1, createdAt: 1, orderCount: 1, totalSpent: 1 } },
  ])

  res.json({ success: true, customers })
})

// Earliest-stage status — an order sitting here needs an admin to
// actually do something next (review it, request payment), unlike later
// fulfillment stages which are just "in progress." Powers the dashboard's
// "Needs attention" list.
const NEEDS_ATTENTION_STATUSES = ['request_received']

export const getStats = asyncHandler(async (_req, res) => {
  const [totalCustomers, totalOrders, activeOrders, completedOrders, cancelledOrders, needsAttention] =
    await Promise.all([
      User.countDocuments({ role: 'client' }),
      PickupRequest.countDocuments(),
      PickupRequest.countDocuments({ status: { $nin: TERMINAL_STATUSES } }),
      PickupRequest.countDocuments({ status: 'ready_delivered' }),
      PickupRequest.countDocuments({ status: 'cancelled' }),
      PickupRequest.find({ status: { $in: NEEDS_ATTENTION_STATUSES } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('clientId', 'name email')
        .select('status preferredDate window clientId guest source'),
    ])

  res.json({
    success: true,
    stats: { totalCustomers, totalOrders, activeOrders, completedOrders, cancelledOrders },
    needsAttention,
  })
})

// Emails the customer/guest a link to pay — the price itself was already
// computed automatically at booking time (see utils/pricing.js), so this
// is purely "go pay now", not "here's your price". Only paymentStatus
// moves here; `status` stays at 'request_received' until an admin
// actually advances the order (payment is tracked separately from the
// 4-stage fulfillment timeline).
//
// Guests have no account/preferences to opt out with, so they always get
// this email (it's the only way they'd ever know their order needs
// payment). Logged-in customers can turn it off via Settings ->
// emailNotifications — respected here, but paymentStatus still moves to
// pending either way; only the email is skipped.
export const sendPaymentRequest = asyncHandler(async (req, res) => {
  const pickup = await PickupRequest.findById(req.params.id)
    .select('+guestAccessToken')
    .populate('clientId', 'name email emailNotifications')
  if (!pickup) throw new ApiError(404, 'Order not found.')
  if (pickup.paymentStatus === 'paid') throw new ApiError(409, 'This order has already been paid for.')
  if (!pickup.pricing?.amount) throw new ApiError(409, 'This order has no price set.')

  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
  const recipientEmail = pickup.source === 'guest' ? pickup.guest?.email : pickup.clientId?.email
  const recipientName = pickup.source === 'guest' ? pickup.guest?.name : pickup.clientId?.name
  const link =
    pickup.source === 'guest'
      ? `${CLIENT_URL}/guest/request/${pickup._id}?token=${pickup.guestAccessToken}`
      : `${CLIENT_URL}/orders`

  pickup.paymentStatus = 'pending'
  pickup.paymentLink = link
  await pickup.save()

  const optedOut = pickup.source === 'account' && pickup.clientId?.emailNotifications === false
  let emailSent = false

  if (recipientEmail && !optedOut) {
    try {
      await sendPaymentRequestEmail(recipientEmail, recipientName, pickup.pricing.amount, pickup.pricing.currency, link)
      emailSent = true
    } catch (err) {
      console.error('Failed to send payment request email', err)
    }
  }

  res.json({ success: true, pickup, emailSent, notificationsOptedOut: optedOut })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!ALL_STATUSES.includes(status)) throw new ApiError(422, 'Invalid status.')

  const pickup = await PickupRequest.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!pickup) throw new ApiError(404, 'Order not found.')

  res.json({ success: true, pickup })
})
