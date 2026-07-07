import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import SEO from '../components/SEO'
import OrderTimeline from '../components/OrderTimeline'
import { useToast } from '../context/ToastContext'
import { ALL_STATUSES, STATUS_LABELS } from '../constants/orderStatus'
import { fetchMyPickups, payMyOrder } from '../services/pickupApi'

function EmptyOrdersIllustration() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20 text-periwinkle-muted" fill="none" aria-hidden="true">
      <rect x="18" y="30" width="60" height="46" rx="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 44h60" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="37" r="3" fill="currentColor" />
      <path
        d="M34 30v-6a14 14 0 0 1 28 0v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const WINDOW_LABELS = {
  morning: 'Morning · 8am – 11am',
  afternoon: 'Afternoon · 12pm – 3pm',
  evening: 'Evening · 4pm – 7pm',
}

const LOAD_SIZE_LABELS = {
  small: 'Small load · 1–2 bags',
  medium: 'Medium load · 3–4 bags',
  large: 'Large load · 5+ bags',
}

function statusBadgeClass(status) {
  if (status === 'cancelled') return 'bg-red-50 text-red-600'
  if (status === 'completed') return 'bg-success-soft text-success-dark'
  return 'bg-periwinkle-soft text-periwinkle-text'
}

function formatMoney(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount)
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Older paid orders (from before pricing.subtotal/deliveryFee existed)
// only have a total — shown without a line-item breakdown in that case.
function OrderReceipt({ pickup }) {
  const { pricing } = pickup
  const hasBreakdown = typeof pricing?.subtotal === 'number' && typeof pricing?.deliveryFee === 'number'

  return (
    <div className="mt-4 rounded-2xl bg-linen-soft p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-ink/50">
        <span>Order #{pickup._id.slice(-8).toUpperCase()}</span>
        <span>Placed {formatDate(pickup.createdAt)}</span>
        {pickup.paidAt && <span>Paid {formatDate(pickup.paidAt)}</span>}
      </div>

      <div className="mt-3 space-y-1.5 border-t border-line/80 pt-3">
        {hasBreakdown ? (
          <>
            <div className="flex justify-between text-ink/70">
              <span>{LOAD_SIZE_LABELS[pickup.loadSize] || 'Wash & fold'}</span>
              <span>{formatMoney(pricing.subtotal, pricing.currency)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Delivery fee</span>
              <span>{pricing.deliveryFee === 0 ? 'Free' : formatMoney(pricing.deliveryFee, pricing.currency)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-ink/70">
            <span>{LOAD_SIZE_LABELS[pickup.loadSize] || 'Wash & fold'}</span>
            <span>—</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line/80 pt-1.5 font-semibold text-ink">
          <span>Total paid</span>
          <span>{formatMoney(pricing.amount, pricing.currency)}</span>
        </div>
      </div>
    </div>
  )
}

// `detailed` adds the full order timeline + a "pay now" action — used by
// the Orders page's full list. Home.jsx's compact "recent activity" cards
// omit it and stay exactly as before.
export function PickupCard({ pickup, detailed = false, onChange }) {
  const { showToast } = useToast()
  const [payStatus, setPayStatus] = useState('idle')
  const [showReceipt, setShowReceipt] = useState(false)

  const dateLabel = new Date(pickup.preferredDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  async function handlePay() {
    setPayStatus('pending')
    try {
      const { pickup: updated } = await payMyOrder(pickup._id)
      onChange?.(updated)
      showToast('Payment sent.')
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setPayStatus('idle')
    }
  }

  return (
    <div className="rounded-2xl border border-line px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-ink">
            {dateLabel} · {WINDOW_LABELS[pickup.window]}
          </p>
          <p className="mt-0.5 text-sm text-ink/55">
            {pickup.address.street}, {pickup.address.city}, {pickup.address.state}
          </p>
          {pickup.notes && <p className="mt-1 text-sm text-ink/45">Note: {pickup.notes}</p>}
          {pickup.pricing?.amount && (
            <p className="mt-1 text-sm font-semibold text-ink">
              {formatMoney(pickup.pricing.amount, pickup.pricing.currency)}
              <span className="ml-1.5 font-normal text-ink/45 capitalize">· {pickup.paymentStatus}</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(pickup.status)}`}
          >
            {STATUS_LABELS[pickup.status] || pickup.status}
          </span>
          {detailed && (
            <Button
              to="/book"
              state={{ rebook: { street: pickup.address.street, city: pickup.address.city, zip: pickup.address.zip, loadSize: pickup.loadSize, notes: pickup.notes || '' } }}
              variant="ghost"
              className="px-3! py-1.5! text-xs!"
            >
              Book again
            </Button>
          )}
        </div>
      </div>

      {detailed && (pickup.paymentStatus === 'pending' || pickup.paymentStatus === 'failed') && (
        <div className="mt-4 border-t border-line pt-4">
          {pickup.paymentStatus === 'failed' && (
            <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              Your last payment attempt failed — try again.
            </p>
          )}
          {/* Simulated payment — stands in for a real Stripe Checkout
              redirect until Stripe API keys are wired up. */}
          <Button onClick={handlePay} variant="primary" className="w-full sm:w-auto" disabled={payStatus === 'pending'}>
            {payStatus === 'pending'
              ? 'Processing…'
              : `Pay ${formatMoney(pickup.pricing.amount, pickup.pricing.currency)} now`}
          </Button>
        </div>
      )}

      {detailed && pickup.paymentStatus === 'paid' && (
        <div className="mt-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setShowReceipt((v) => !v)}
            className="text-sm font-semibold text-periwinkle-text hover:underline"
          >
            {showReceipt ? 'Hide receipt' : 'View receipt'}
          </button>
          {showReceipt && <OrderReceipt pickup={pickup} />}
        </div>
      )}

      {detailed && (
        <div className="mt-4 border-t border-line pt-4">
          <OrderTimeline status={pickup.status} />
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const [pickups, setPickups] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchMyPickups()
      .then(({ pickups: list }) => {
        if (!cancelled) setPickups(list)
      })
      .catch(() => {
        if (!cancelled) setPickups([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleChange(updated) {
    setPickups((list) => list.map((p) => (p._id === updated._id ? updated : p)))
  }

  // Filtered client-side — a customer's own order history is small enough
  // that a query-param round trip (the pattern AdminOrders.jsx uses for the
  // full order table) would just be extra latency for no benefit here.
  const filtered = useMemo(() => {
    if (!pickups) return []
    const q = search.trim().toLowerCase()
    return pickups.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.address.street.toLowerCase().includes(q) ||
        p.address.city.toLowerCase().includes(q) ||
        (p.notes || '').toLowerCase().includes(q)
      )
    })
  }, [pickups, search, statusFilter])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="My Orders" description="Your Looppr pickup request history and status." noindex />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
            Orders
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            My pickup requests
          </h1>
        </div>
        <Button to="/book" variant="primary">
          Schedule a pickup
        </Button>
      </div>

      {pickups && pickups.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address or notes…"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle sm:max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {pickups === null ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : pickups.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <EmptyOrdersIllustration />
            <div>
              <p className="font-medium text-ink">No pickups requested yet</p>
              <p className="mt-1 text-sm text-ink/55">
                Book your first pickup and it'll show up here.
              </p>
            </div>
            <Button to="/book" variant="primary" className="mt-2">
              Schedule a pickup
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No orders match your filters.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PickupCard key={p._id} pickup={p} detailed onChange={handleChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
