// The full order lifecycle. Keep this list, its mirror in
// looppr/src/constants/orderStatus.js, and PickupRequest's status enum in
// sync — nothing derives them from each other automatically (separate
// deployable packages, no shared module system between them).
//
// 'cancelled' is a side-exit reachable from any non-terminal stage, not a
// step in the main sequence — ORDER_FLOW below excludes it on purpose.
export const ORDER_FLOW = [
  'requested',
  'pending_review',
  'awaiting_payment',
  'payment_successful',
  'pickup_scheduled',
  'pickup_in_progress',
  'laundry_received',
  'washing',
  'drying',
  'folding',
  'quality_check',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'completed',
]

export const ALL_STATUSES = [...ORDER_FLOW, 'cancelled']

export const TERMINAL_STATUSES = ['completed', 'cancelled']
