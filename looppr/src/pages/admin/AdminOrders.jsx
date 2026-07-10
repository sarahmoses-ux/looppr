import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import { useToast } from '../../context/ToastContext'
import { ALL_STATUSES } from '../../constants/orderStatus'
import { fetchAllPickups, updateOrderStatus } from '../../services/adminApi'

const WINDOW_LABELS = {
  morning: 'Morning · 8am – 11am',
  afternoon: 'Afternoon · 12pm – 3pm',
  evening: 'Evening · 4pm – 7pm',
}

const PAYMENT_STYLES = {
  unpaid: 'bg-ink/5 text-ink/50',
  pending: 'bg-periwinkle-soft text-periwinkle-text',
  paid: 'bg-success-soft text-success-dark',
  failed: 'bg-red-50 text-red-600',
}

function formatMoney(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount)
}

function AdminOrderRow({ pickup, onChange }) {
  const { showToast } = useToast()
  const contact = pickup.clientId || pickup.guest
  const notificationsOff = pickup.source === 'account' && pickup.clientId?.emailNotifications === false
  const dateLabel = new Date(pickup.preferredDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  async function handleStatusChange(e) {
    const status = e.target.value
    try {
      const { pickup: updated } = await updateOrderStatus(pickup._id, status)
      onChange(updated)
    } catch {
      // The <select> reverts on next render since we never applied an
      // optimistic update — still worth telling the admin it didn't save.
      showToast('Could not update order status. Please try again.', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {contact?.name || 'Unknown'}
          <span className="font-normal text-ink/45"> · {contact?.email}</span>
          {pickup.source === 'guest' && (
            <span className="ml-2 rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/50">
              Guest
            </span>
          )}
          {notificationsOff && (
            <span className="ml-2 rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/50">
              Notifications off
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {dateLabel} · {WINDOW_LABELS[pickup.window]}
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {pickup.address.street}, {pickup.address.city}, {pickup.address.state} {pickup.address.zip}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {formatMoney(pickup.pricing.amount, pickup.pricing.currency)}
          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${PAYMENT_STYLES[pickup.paymentStatus]}`}>
            {pickup.paymentStatus}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <select
          value={pickup.status}
          onChange={handleStatusChange}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-periwinkle"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [pickups, setPickups] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    // Deliberately not resetting to null here — keep the current list
    // visible (stale-while-revalidating) instead of flashing the skeleton
    // loader on every keystroke/filter change.
    fetchAllPickups({
      search: search || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentFilter || undefined,
    })
      .then(({ pickups: list }) => {
        if (!cancelled) setPickups(list)
      })
      .catch(() => {
        if (!cancelled) setPickups([])
      })
    return () => {
      cancelled = true
    }
  }, [search, statusFilter, paymentFilter])

  function handleChange(updated) {
    setPickups((list) => list.map((p) => (p._id === updated._id ? updated : p)))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Orders" description="All Looppr laundry orders." noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Orders
      </h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or address…"
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
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        >
          <option value="">All payment statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {pickups === null ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : pickups.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No orders match your filters.</p>
        ) : (
          <div className="space-y-3">
            {pickups.map((p) => (
              <AdminOrderRow key={p._id} pickup={p} onChange={handleChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
