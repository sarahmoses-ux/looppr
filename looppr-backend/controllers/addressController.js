import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).select('savedAddresses')
  if (!user) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, addresses: user.savedAddresses })
})

export const addAddress = asyncHandler(async (req, res) => {
  const { label, street, apartment, city, state, zip } = req.body
  const user = await User.findById(req.user.sub)
  if (!user) throw new ApiError(401, 'Not authenticated.')

  user.savedAddresses.push({
    label: label || 'Address',
    street,
    apartment: apartment || '',
    city,
    state: state || 'OK',
    zip,
  })
  await user.save()

  res.status(201).json({ success: true, addresses: user.savedAddresses })
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub)
  if (!user) throw new ApiError(401, 'Not authenticated.')

  const before = user.savedAddresses.length
  user.savedAddresses = user.savedAddresses.filter((a) => a._id.toString() !== req.params.id)
  if (user.savedAddresses.length === before) throw new ApiError(404, 'Address not found.')

  await user.save()
  res.json({ success: true, addresses: user.savedAddresses })
})
