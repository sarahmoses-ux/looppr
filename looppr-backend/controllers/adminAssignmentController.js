import { ActivityLog } from '../models/ActivityLog.js'
import { DriverUser } from '../models/DriverUser.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Manual override for when the normal flow gets stuck — auto-assignment
// failed at creation, or every partner/driver in range rejected the order.
// Writes the exact same fields a normal accept would (see
// partnerController.js/driverController.js), so the rest of the app can't
// tell the difference between a force-assign and a real claim.

export const assignPartnerToOrder = asyncHandler(async (req, res) => {
  const { partnerUserId } = req.body
  const partner = await PartnerUser.findById(partnerUserId)
  if (!partner) throw new ApiError(404, 'Partner not found.')
  if (partner.accountStatus !== 'active') throw new ApiError(409, 'This partner is not active.')

  const pickup = await PickupRequest.findById(req.params.id)
  if (!pickup) throw new ApiError(404, 'Order not found.')

  pickup.partnerUserId = partner._id
  pickup.partnerStage = 'accepted'
  pickup.partnerAcceptedAt = new Date()
  pickup.partnerRejectedBy = pickup.partnerRejectedBy.filter((id) => id.toString() !== partner._id.toString())
  await pickup.save()

  await ActivityLog.create({
    actorType: 'admin',
    actorId: req.user.sub,
    action: 'order_force_assigned_partner',
    entityType: 'PickupRequest',
    entityId: pickup._id,
    metadata: { partnerUserId: partner._id },
  }).catch(() => {})

  res.json({ success: true, pickup })
})

export const assignDriverToOrder = asyncHandler(async (req, res) => {
  const { driverUserId } = req.body
  const driver = await DriverUser.findById(driverUserId)
  if (!driver) throw new ApiError(404, 'Driver not found.')
  if (driver.accountStatus !== 'active') throw new ApiError(409, 'This driver is not active.')

  const pickup = await PickupRequest.findById(req.params.id)
  if (!pickup) throw new ApiError(404, 'Order not found.')

  const previousDriverId = pickup.driverUserId
  const reassigning = previousDriverId && previousDriverId.toString() !== driver._id.toString()

  pickup.driverUserId = driver._id
  pickup.driverStage = 'assigned'
  pickup.driverAcceptedAt = new Date()
  pickup.driverRejectedBy = pickup.driverRejectedBy.filter((id) => id.toString() !== driver._id.toString())
  await pickup.save()

  if (reassigning) {
    await DriverUser.findByIdAndUpdate(previousDriverId, { $inc: { activeDeliveryCount: -1 } }).catch(() => {})
  }
  if (reassigning || !previousDriverId) {
    await DriverUser.findByIdAndUpdate(driver._id, { $inc: { activeDeliveryCount: 1 } }).catch(() => {})
  }

  await ActivityLog.create({
    actorType: 'admin',
    actorId: req.user.sub,
    action: 'order_force_assigned_driver',
    entityType: 'PickupRequest',
    entityId: pickup._id,
    metadata: { driverUserId: driver._id },
  }).catch(() => {})

  res.json({ success: true, pickup })
})
