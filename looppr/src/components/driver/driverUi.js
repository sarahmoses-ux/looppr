// Presentation helpers for the Driver Portal. Money/date/orderRef are reused
// from the business kit to stay consistent across portals (same pattern the
// Partner Portal already uses).
export { formatCurrency, formatDate, orderRef } from '../business/businessUi'

// Driver-facing delivery lifecycle (driverStage on PickupRequest). `new` is
// the derived state for unclaimed incoming deliveries (no driverStage yet).
export const STAGE_META = {
  new: { label: 'New Request', style: 'bg-sky-50 text-sky-700 ring-sky-100' },
  assigned: { label: 'Driver Assigned', style: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
  pickup_completed: { label: 'Pickup Completed', style: 'bg-amber-50 text-amber-700 ring-amber-100' },
  at_laundromat: { label: 'At Laundromat', style: 'bg-violet-50 text-violet-700 ring-violet-100' },
  out_for_delivery: { label: 'Out for Delivery', style: 'bg-cyan-50 text-cyan-700 ring-cyan-100' },
  delivered: { label: 'Delivered', style: 'bg-success-soft text-success-dark ring-success/20' },
}

export function stageOf(delivery) {
  return delivery.driverStage || 'new'
}

export function stageMeta(delivery) {
  return STAGE_META[stageOf(delivery)] || STAGE_META.new
}

// The next action a driver can take, given the current stage.
export const NEXT_ACTION = {
  assigned: { action: 'pickup_completed', label: 'Mark picked up from customer' },
  pickup_completed: { action: 'at_laundromat', label: 'Mark dropped at laundromat' },
  at_laundromat: { action: 'out_for_delivery', label: 'Mark picked up for delivery' },
  out_for_delivery: { action: 'delivered', label: 'Mark delivered' },
}

export const ACTIVE_STAGES = ['assigned', 'pickup_completed', 'at_laundromat', 'out_for_delivery']

export const VEHICLE_OPTIONS = [
  { value: 'bike', label: 'Bike' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
]

export const VEHICLE_LABELS = Object.fromEntries(VEHICLE_OPTIONS.map((v) => [v.value, v.label]))

export const LOAD_SIZE_LABELS = {
  small: 'Small (~10 lbs)',
  medium: 'Medium (~20 lbs)',
  large: 'Large (~35 lbs)',
}

// Mirrors backend utils/pricing.js LOAD_SIZE_LBS — the estimated weight
// behind each loadSize bucket, used as the starting value when a driver
// confirms/corrects the actual pounds.
export const LOAD_SIZE_LBS = { small: 10, medium: 20, large: 35 }

// A driver-confirmed weight overrides the customer/business's original
// loadSize estimate for display — this is the single place that decides
// which number wins, so cards/labels never disagree.
export function displayWeight(delivery) {
  if (delivery.actualWeightLbs != null) return `${delivery.actualWeightLbs} lbs (confirmed)`
  return LOAD_SIZE_LABELS[delivery.loadSize] || delivery.loadSize
}

export function estimatedLbs(delivery) {
  return delivery.actualWeightLbs ?? LOAD_SIZE_LBS[delivery.loadSize] ?? LOAD_SIZE_LBS.medium
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
