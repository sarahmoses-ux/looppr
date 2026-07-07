// Mirrors looppr-backend/constants/orderStatus.js — keep both in sync
// manually (separate deployable packages, no shared module between them).
export const ORDER_FLOW = [
  { value: 'requested', label: 'Request Submitted' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'payment_successful', label: 'Payment Successful' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'pickup_in_progress', label: 'Pickup In Progress' },
  { value: 'laundry_received', label: 'Laundry Received' },
  { value: 'washing', label: 'Washing' },
  { value: 'drying', label: 'Drying' },
  { value: 'folding', label: 'Ironing/Folding' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'ready_for_delivery', label: 'Ready For Delivery' },
  { value: 'out_for_delivery', label: 'Out For Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
]

export const ALL_STATUSES = [...ORDER_FLOW, { value: 'cancelled', label: 'Cancelled' }]

export const STATUS_LABELS = Object.fromEntries(ALL_STATUSES.map((s) => [s.value, s.label]))

export const TERMINAL_STATUSES = ['completed', 'cancelled']
