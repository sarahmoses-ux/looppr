import { PickupRequest } from '../models/PickupRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createPickup = asyncHandler(async (req, res) => {
  const { address, preferredDate, window, loadSize, notes } = req.body

  const pickup = await PickupRequest.create({
    clientId: req.user.sub,
    address,
    preferredDate,
    window,
    loadSize,
    notes,
  })

  res.status(201).json({ success: true, pickup })
})

export const listMyPickups = asyncHandler(async (req, res) => {
  const pickups = await PickupRequest.find({ clientId: req.user.sub }).sort({ createdAt: -1 })
  res.json({ success: true, pickups })
})
