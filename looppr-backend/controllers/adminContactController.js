import { ContactMessage } from '../models/ContactMessage.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Kept separate from adminController.js (pickups/customers/stats) — a
// distinct concern, same pattern as adminApplicationsController.js.

export const listContactMessages = asyncHandler(async (req, res) => {
  const { status } = req.query
  const match = {}
  if (status === 'open') match.handled = false
  if (status === 'handled') match.handled = true

  const messages = await ContactMessage.find(match).sort({ createdAt: -1 })
  res.json({ success: true, messages })
})

export const resolveContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id)
  if (!message) throw new ApiError(404, 'Message not found.')
  if (message.handled) throw new ApiError(409, 'This message has already been marked handled.')

  message.handled = true
  message.handledAt = new Date()
  await message.save()

  res.json({ success: true, message })
})
