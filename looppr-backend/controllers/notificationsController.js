import { Notification } from '../models/Notification.js'
import { PushToken } from '../models/PushToken.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find(req.actor).sort({ createdAt: -1 }).limit(50)
  res.json({ success: true, notifications })
})

export const registerPushToken = asyncHandler(async (req, res) => {
  const { token } = req.body
  await PushToken.findOneAndUpdate(req.actor, { token }, { upsert: true })
  res.json({ success: true })
})

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ ...req.actor, read: false }, { read: true })
  const notifications = await Notification.find(req.actor).sort({ createdAt: -1 }).limit(50)
  res.json({ success: true, notifications })
})
