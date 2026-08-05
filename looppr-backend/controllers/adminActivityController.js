import { ACTIVITY_ACTOR_TYPES, ACTIVITY_ENTITY_TYPES, ActivityLog } from '../models/ActivityLog.js'
import { DriverUser } from '../models/DriverUser.js'
import { PartnerUser } from '../models/PartnerUser.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// entityId has no schema-level `ref` (it's polymorphic across
// ACTIVITY_ENTITY_TYPES), so it can't be populated directly — each entity
// type resolved here needs its own lookup query keyed by entityType.
// Anything not listed below (Rider, LaundryPartner, User — no write site
// targets these yet) comes back with entity: null rather than a guess.
export const listActivity = asyncHandler(async (req, res) => {
  const { actorType, entityType } = req.query
  const match = {}
  if (ACTIVITY_ACTOR_TYPES.includes(actorType)) match.actorType = actorType
  if (ACTIVITY_ENTITY_TYPES.includes(entityType)) match.entityType = entityType

  const activity = await ActivityLog.find(match).sort({ createdAt: -1 }).limit(100).lean()

  const pickupIds = activity.filter((a) => a.entityType === 'PickupRequest').map((a) => a.entityId)
  const driverIds = activity.filter((a) => a.entityType === 'DriverUser').map((a) => a.entityId)
  const partnerIds = activity.filter((a) => a.entityType === 'PartnerUser').map((a) => a.entityId)

  const [pickups, drivers, partners] = await Promise.all([
    PickupRequest.find({ _id: { $in: pickupIds } })
      .select('guest clientId address source')
      .populate('clientId', 'name email')
      .lean(),
    DriverUser.find({ _id: { $in: driverIds } }).select('name email city').lean(),
    PartnerUser.find({ _id: { $in: partnerIds } }).select('businessName ownerName email city').lean(),
  ])
  const pickupsById = new Map(pickups.map((p) => [p._id.toString(), p]))
  const driversById = new Map(drivers.map((d) => [d._id.toString(), d]))
  const partnersById = new Map(partners.map((p) => [p._id.toString(), p]))

  const enriched = activity.map((a) => {
    let entity = null
    if (a.entityType === 'PickupRequest') entity = pickupsById.get(a.entityId.toString()) ?? null
    if (a.entityType === 'DriverUser') entity = driversById.get(a.entityId.toString()) ?? null
    if (a.entityType === 'PartnerUser') entity = partnersById.get(a.entityId.toString()) ?? null
    return { ...a, entity }
  })

  res.json({ success: true, activity: enriched })
})
