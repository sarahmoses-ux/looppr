// Shared presentation helpers for the Business Portal — one place for status
// styling, money and date formatting so every dashboard section renders the
// same way.
import { STATUS_LABELS } from '../../constants/orderStatus'

export const STATUS_STYLES = {
  request_received: 'bg-sky-50 text-sky-700 ring-sky-100',
  pickup: 'bg-amber-50 text-amber-700 ring-amber-100',
  laundry_in_progress: 'bg-violet-50 text-violet-700 ring-violet-100',
  ready_delivered: 'bg-success-soft text-success-dark ring-success/20',
  cancelled: 'bg-red-50 text-red-600 ring-red-100',
}

export function statusLabel(value) {
  return STATUS_LABELS[value] || value
}

export function formatCurrency(amount) {
  const value = Number.isFinite(amount) ? amount : 0
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatDate(input, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', opts)
}

export const WINDOW_LABELS = {
  morning: 'Morning (8am–12pm)',
  afternoon: 'Afternoon (12pm–4pm)',
  evening: 'Evening (4pm–8pm)',
}

export const LOAD_SIZE_LABELS = {
  small: 'Small (~10 lbs)',
  medium: 'Medium (~20 lbs)',
  large: 'Large (~35 lbs)',
}

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'airbnb', label: 'Airbnb / Short-term rental' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hospital', label: 'Hospital / Clinic' },
  { value: 'gym', label: 'Gym / Fitness studio' },
  { value: 'spa', label: 'Spa' },
  { value: 'salon', label: 'Salon' },
  { value: 'office', label: 'Office' },
  { value: 'school', label: 'School' },
  { value: 'event_center', label: 'Event center' },
  { value: 'other', label: 'Other' },
]

export const BUSINESS_TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPE_OPTIONS.map((o) => [o.value, o.label]),
)

// Short, human-friendly order reference from a Mongo _id (last 6 chars).
export function orderRef(id) {
  return id ? `#${String(id).slice(-6).toUpperCase()}` : '—'
}

export const ACTIVE_STATUSES = ['request_received', 'pickup', 'laundry_in_progress']

// Maps an order's current status to one of the four dashboard notification
// types (Pickup Confirmed / Laundry In Progress / Ready For Delivery /
// Delivered Successfully).
export function pickupNotification(pickup) {
  const map = {
    request_received: { title: 'Pickup Confirmed', tone: 'sky', body: 'Your pickup is scheduled and confirmed.' },
    pickup: { title: 'Pickup Confirmed', tone: 'sky', body: 'A driver is on the way to collect your laundry.' },
    laundry_in_progress: { title: 'Laundry In Progress', tone: 'violet', body: 'Your laundry is being cleaned and folded.' },
    ready_delivered: { title: 'Delivered Successfully', tone: 'success', body: 'Your order has been delivered.' },
    cancelled: { title: 'Order Cancelled', tone: 'amber', body: 'This order was cancelled.' },
  }
  const meta = map[pickup.status] || map.request_received
  return { ...meta, ref: orderRef(pickup._id), time: formatDate(pickup.updatedAt || pickup.createdAt) }
}
