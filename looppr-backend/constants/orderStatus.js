// The full order lifecycle. Keep this list, its mirror in
// looppr/src/constants/orderStatus.js, and PickupRequest's status enum in
// sync — nothing derives them from each other automatically (separate
// deployable packages, no shared module system between them).
//
// Deliberately just 4 customer-facing stages rather than a granular
// per-step pipeline — simpler for customers to read on the tracking
// timeline, and simpler for admins to manage. Payment (paymentStatus, a
// separate field) is tracked independently and doesn't move `status` on
// its own; it all happens within the 'request_received' stage.
//
// 'cancelled' is a side-exit reachable from any non-terminal stage, not a
// step in the main sequence — ORDER_FLOW below excludes it on purpose.
export const ORDER_FLOW = ['request_received', 'pickup', 'laundry_in_progress', 'ready_delivered']

export const ALL_STATUSES = [...ORDER_FLOW, 'cancelled']

export const TERMINAL_STATUSES = ['ready_delivered', 'cancelled']
