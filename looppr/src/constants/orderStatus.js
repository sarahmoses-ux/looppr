// Mirrors looppr-backend/constants/orderStatus.js — keep both in sync
// manually (separate deployable packages, no shared module between them).
export const ORDER_FLOW = [
  { value: 'request_received', label: 'Request Received' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'laundry_in_progress', label: 'Laundry In Progress' },
  { value: 'ready_delivered', label: 'Ready & Delivered' },
]

export const ALL_STATUSES = [...ORDER_FLOW, { value: 'cancelled', label: 'Cancelled' }]

export const STATUS_LABELS = Object.fromEntries(ALL_STATUSES.map((s) => [s.value, s.label]))

export const TERMINAL_STATUSES = ['ready_delivered', 'cancelled']
