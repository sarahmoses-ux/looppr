import { ActivityLog } from '../models/ActivityLog.js'
import { PartnerUser } from '../models/PartnerUser.js'

// The ONE place order → laundromat assignment decisions get made. Every
// order-creation controller (pickupController, guestPickupController,
// businessController) calls resolveAssignment() identically and merges the
// result into its PickupRequest.create() call — none of them contain any
// assignment logic themselves.
//
// Today this only implements one rule: fall back to the flagged default
// in-house laundromat. Future rules (nearest via geoLocation $near,
// service-area, workload/maxDailyCapacity) get added inside this function,
// in priority order, tried before this fallback, without changing the
// signature or touching any controller again. `context` is intentionally
// broader than today's needs so those rules can be added later:
//   - loadSize:    for future capacity-aware routing
//   - address:     for future service-area rules
//   - geoLocation:  GeoJSON Point, for future $near nearest-partner matching
//   - source:      'account' | 'guest' | 'business', for any future
//                  source-specific routing
//
// Returns either the three fields acceptOrder() would set on a manual claim
// (partnerUserId, partnerStage, partnerAcceptedAt) — mirroring that write
// exactly so an auto-assigned order is indistinguishable from a manually
// accepted one — or `null` if no assignment could be made. Callers must
// treat `null` as "leave the order unassigned" and must NOT fail order
// creation because of it.
export async function resolveAssignment(_context = {}) {
  const defaultPartner = await PartnerUser.findOne({
    isDefaultLaundromat: true,
    accountStatus: 'active',
  }).select('_id')

  if (!defaultPartner) return null

  return {
    partnerUserId: defaultPartner._id,
    partnerStage: 'accepted',
    partnerAcceptedAt: new Date(),
  }
}

// Records the assignment outcome on the newly created pickup, success or
// soft-fail. Self-contained and non-throwing (mirrors the .catch(() => {})
// pattern in partnerController.js) so every call site is a single bare
// `await`, with no try/catch needed — logging failures must never surface
// to the customer or fail the request.
export async function logAssignmentOutcome(pickup, assignment) {
  try {
    if (assignment) {
      await ActivityLog.create({
        actorType: 'system',
        actorId: assignment.partnerUserId,
        action: 'order_auto_assigned',
        entityType: 'PickupRequest',
        entityId: pickup._id,
        metadata: { partnerUserId: assignment.partnerUserId, rule: 'default_laundromat' },
      })
    } else {
      // Soft-fail path: order was created fully unassigned because no
      // default laundromat is configured/active in this environment. Not a
      // request failure — just a trail for ops to notice and fix.
      await ActivityLog.create({
        actorType: 'system',
        action: 'order_auto_assign_failed',
        entityType: 'PickupRequest',
        entityId: pickup._id,
        metadata: { reason: 'no_default_laundromat_configured' },
      })
    }
  } catch (err) {
    console.error('Failed to log assignment outcome', err)
  }
}
