import { Notification } from '../models/Notification.js'
import { PushToken } from '../models/PushToken.js'
import { sendPush } from './pushService.js'

// The one place a notification gets created -- always writes a real
// Notification record, and additionally pushes to the device if one is
// registered. Never throws: notifying is a side effect of a real action
// (an order moved forward), and must never be the reason that action fails.
export async function notify({ ownerType, ownerId, title, body, type, data }) {
  try {
    await Notification.create({ ownerType, ownerId, title, body, type, data })

    const pushToken = await PushToken.findOne({ ownerType, ownerId })
    if (pushToken) {
      await sendPush(pushToken.token, { title, body, data })
    }
  } catch (err) {
    console.error('Failed to notify', { ownerType, ownerId, type }, err)
  }
}

// Resolves which real account placed a pickup -- 'guest' orders have no
// account and so no notification target, which is intentional, not a gap.
export function pickupOwner(pickup) {
  if (pickup.source === 'account' && pickup.clientId) {
    return { ownerType: 'residential', ownerId: pickup.clientId._id || pickup.clientId }
  }
  if (pickup.source === 'business' && pickup.businessId) {
    return { ownerType: 'business', ownerId: pickup.businessId._id || pickup.businessId }
  }
  return null
}

export async function notifyPickupOwner(pickup, { title, body, type, data }) {
  const owner = pickupOwner(pickup)
  if (!owner) return
  await notify({ ...owner, title, body, type, data })
}
