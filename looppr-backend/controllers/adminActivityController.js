import { ACTIVITY_ACTOR_TYPES, ACTIVITY_ENTITY_TYPES, ActivityLog } from '../models/ActivityLog.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// entityId has no schema-level `ref` (it's polymorphic across
// ACTIVITY_ENTITY_TYPES), so it can't be populated directly. Every
// ActivityLog.create() call site today only ever targets 'PickupRequest',
// so that's the only entity type resolved into a readable record here —
// anything else comes back with entity: null rather than a guess.
export const listActivity = asyncHandler(async (req, res) => {
  const { actorType, entityType } = req.query
  const match = {}
  if (ACTIVITY_ACTOR_TYPES.includes(actorType)) match.actorType = actorType
  if (ACTIVITY_ENTITY_TYPES.includes(entityType)) match.entityType = entityType

  const activity = await ActivityLog.find(match).sort({ createdAt: -1 }).limit(100).lean()

  const pickupIds = activity.filter((a) => a.entityType === 'PickupRequest').map((a) => a.entityId)
  const pickups = await PickupRequest.find({ _id: { $in: pickupIds } })
    .select('guest clientId address source')
    .populate('clientId', 'name email')
    .lean()
  const pickupsById = new Map(pickups.map((p) => [p._id.toString(), p]))

  const enriched = activity.map((a) => ({
    ...a,
    entity: a.entityType === 'PickupRequest' ? (pickupsById.get(a.entityId.toString()) ?? null) : null,
  }))

  res.json({ success: true, activity: enriched })
})
