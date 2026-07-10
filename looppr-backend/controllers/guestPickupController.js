import crypto from 'crypto'
import { PickupRequest } from '../models/PickupRequest.js'
import { geocodeAddress } from '../services/geocodeService.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { computeOrderPrice } from '../utils/pricing.js'

function guestPublic(pickup) {
  return {
    id: pickup._id.toString(),
    source: pickup.source,
    guest: pickup.guest,
    address: pickup.address,
    preferredDate: pickup.preferredDate,
    window: pickup.window,
    loadSize: pickup.loadSize,
    notes: pickup.notes,
    deliveryWindow: pickup.deliveryWindow,
    deliveryAddress: pickup.deliveryAddress,
    status: pickup.status,
    pricing: pickup.pricing,
    paymentStatus: pickup.paymentStatus,
  }
}

// Looks up a guest request by id + access token, scoped to source: 'guest'
// so this can never be used to read/act on an account-based request.
async function findGuestPickupByToken(id, token) {
  if (!token) throw new ApiError(401, 'Missing access token.')

  const pickup = await PickupRequest.findOne({ _id: id, source: 'guest' }).select('+guestAccessToken')
  if (!pickup || pickup.guestAccessToken !== token) {
    throw new ApiError(404, 'Guest request not found.')
  }
  return pickup
}

export const createGuestPickup = asyncHandler(async (req, res) => {
  const { guest, address, preferredDate, window, loadSize, notes, deliveryWindow, deliveryAddress } = req.body

  const guestAccessToken = crypto.randomBytes(24).toString('hex')

  const priorOrderCount = await PickupRequest.countDocuments({
    'guest.email': guest.email,
    status: { $ne: 'cancelled' },
  })

  const pickup = await PickupRequest.create({
    source: 'guest',
    guest,
    address,
    preferredDate,
    window,
    loadSize,
    notes,
    deliveryWindow,
    deliveryAddress,
    guestAccessToken,
    pricing: computeOrderPrice(loadSize, priorOrderCount),
  })

  try {
    const location = await geocodeAddress(address)
    if (location) {
      pickup.location = location
      await pickup.save()
    }
  } catch (err) {
    console.error('Failed to geocode guest pickup address', err)
  }

  res.status(201).json({ success: true, pickup: guestPublic(pickup), guestAccessToken })
})

export const getGuestPickup = asyncHandler(async (req, res) => {
  const { token } = req.query
  const pickup = await findGuestPickupByToken(req.params.id, token)
  res.json({ success: true, pickup: guestPublic(pickup) })
})

// Simulated payment confirmation — see the identical caveat on
// pickupController.payMyOrder: this is a placeholder for real Stripe
// webhook verification, not a real payment check.
export const payGuestOrder = asyncHandler(async (req, res) => {
  const { token } = req.body
  const pickup = await findGuestPickupByToken(req.params.id, token)

  if (pickup.status === 'cancelled') throw new ApiError(409, 'This request has been cancelled.')
  if (pickup.paymentStatus === 'paid') throw new ApiError(409, 'This request has already been paid for.')

  const updated = await PickupRequest.findOneAndUpdate(
    { _id: pickup._id, paymentStatus: { $ne: 'paid' } },
    { paymentStatus: 'paid', paidAt: new Date() },
    { new: true },
  )
  if (!updated) throw new ApiError(409, 'This request has already been paid for.')

  res.json({ success: true, pickup: guestPublic(updated) })
})
