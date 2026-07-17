// Presentation helpers for the Partner Portal. Money/date/orderRef are reused
// from the business kit to stay consistent across portals.
export { formatCurrency, formatDate, orderRef } from '../business/businessUi'

// Partner-facing order lifecycle (partnerStage on PickupRequest). `new` is the
// derived state for unclaimed incoming orders (no partnerStage yet).
export const STAGE_META = {
  new: { label: 'New Request', style: 'bg-sky-50 text-sky-700 ring-sky-100', dot: 'bg-sky-500' },
  accepted: { label: 'Accepted', style: 'bg-indigo-50 text-indigo-700 ring-indigo-100', dot: 'bg-indigo-500' },
  pickup_completed: { label: 'Pickup Completed', style: 'bg-amber-50 text-amber-700 ring-amber-100', dot: 'bg-amber-500' },
  laundry_in_progress: { label: 'Laundry In Progress', style: 'bg-violet-50 text-violet-700 ring-violet-100', dot: 'bg-violet-500' },
  ready_for_delivery: { label: 'Ready for Delivery', style: 'bg-cyan-50 text-cyan-700 ring-cyan-100', dot: 'bg-cyan-500' },
  delivered: { label: 'Delivered', style: 'bg-success-soft text-success-dark ring-success/20', dot: 'bg-success' },
}

export function stageOf(order) {
  return order.partnerStage || 'new'
}

export function stageMeta(order) {
  return STAGE_META[stageOf(order)] || STAGE_META.new
}

// The next action a partner can take, given the current stage.
export const NEXT_ACTION = {
  accepted: { action: 'pickup_completed', label: 'Mark pickup completed' },
  pickup_completed: { action: 'laundry_in_progress', label: 'Mark laundry in progress' },
  laundry_in_progress: { action: 'ready_for_delivery', label: 'Mark ready for delivery' },
  ready_for_delivery: { action: 'delivered', label: 'Mark delivered' },
}

export const ACTIVE_STAGES = ['accepted', 'pickup_completed', 'laundry_in_progress', 'ready_for_delivery']

export const SERVICE_OPTIONS = [
  { value: 'wash_fold', label: 'Wash & Fold' },
  { value: 'dry_cleaning', label: 'Dry Cleaning' },
  { value: 'ironing', label: 'Ironing / Pressing' },
  { value: 'express', label: 'Express / Same-day' },
  { value: 'commercial', label: 'Commercial / Bulk' },
  { value: 'delicates', label: 'Delicates' },
  { value: 'stain_removal', label: 'Stain Removal' },
  { value: 'bedding', label: 'Bedding & Linens' },
]

export const SERVICE_LABELS = Object.fromEntries(SERVICE_OPTIONS.map((s) => [s.value, s.label]))

export const LOAD_SIZE_LABELS = {
  small: 'Small (~10 lbs)',
  medium: 'Medium (~20 lbs)',
  large: 'Large (~35 lbs)',
}

export const WINDOW_LABELS = {
  morning: 'Morning (8am–12pm)',
  afternoon: 'Afternoon (12pm–4pm)',
  evening: 'Evening (4pm–8pm)',
}

export function formatAddress(a) {
  if (!a) return '—'
  return [a.street, a.city, a.state].filter(Boolean).join(', ')
}
