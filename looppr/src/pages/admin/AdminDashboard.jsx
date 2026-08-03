import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { STATUS_LABELS, TERMINAL_STATUSES } from '../../constants/orderStatus'
import { fetchAllPickups, fetchStats } from '../../services/adminApi'

const STAT_CARDS = [
  { key: 'totalCustomers', label: 'Total customers' },
  { key: 'totalOrders', label: 'Total orders' },
  { key: 'activeOrders', label: 'Active orders' },
  { key: 'completedOrders', label: 'Completed orders' },
  { key: 'cancelledOrders', label: 'Cancelled orders' },
]

const STATUS_STYLES = {
  request_received: 'bg-periwinkle-soft text-periwinkle-text',
  pickup: 'bg-amber-50 text-amber-700',
  laundry_in_progress: 'bg-sky-50 text-sky-700',
  ready_delivered: 'bg-success-soft text-success-dark',
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Rolling 7-day window ending today, grouped by createdAt day — gives a
// quick "is booking volume picking up" read without needing a dedicated
// backend aggregation for what's ultimately a client-side count over data
// the dashboard already has to fetch for the "Today & upcoming" panel.
function buildWeekBars(pickups) {
  const today = startOfDay(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const counts = days.map((day) => {
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    return pickups.filter((p) => {
      const created = new Date(p.createdAt)
      return created >= day && created < next
    }).length
  })
  const max = Math.max(1, ...counts)
  return days.map((day, i) => ({
    label: WEEKDAY_LABELS[day.getDay()],
    val: counts[i],
    h: `${Math.max(6, Math.round((counts[i] / max) * 100))}%`,
  }))
}

function NeedsAttention({ orders }) {
  if (orders === null) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-2xl bg-periwinkle-text/40" />
        <div className="h-14 animate-pulse rounded-2xl bg-periwinkle-text/40" />
      </div>
    )
  }

  if (orders.length === 0) {
    return <p className="text-sm text-linen/80">Nothing needs attention right now.</p>
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const contact = o.clientId || o.guest
        const dateLabel = new Date(o.preferredDate).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
        return (
          <Link key={o._id} to="/admin/orders" className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-linen" />
            <p className="text-sm leading-snug text-linen">
              <span className="font-semibold">{contact?.name || 'Unknown'}</span> — request received{' '}
              {dateLabel}, hasn't moved yet.
            </p>
          </Link>
        )
      })}
    </div>
  )
}

function TodayAndUpcoming({ pickups }) {
  if (pickups === null) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-2xl bg-linen-soft" />
        <div className="h-14 animate-pulse rounded-2xl bg-linen-soft" />
        <div className="h-14 animate-pulse rounded-2xl bg-linen-soft" />
      </div>
    )
  }

  const upcoming = pickups
    .filter((p) => !TERMINAL_STATUSES.includes(p.status))
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))
    .slice(0, 8)

  if (upcoming.length === 0) {
    return <p className="py-6 text-center text-sm text-ink/55">No active orders right now.</p>
  }

  return (
    <div className="divide-y divide-line">
      {upcoming.map((p) => {
        const contact = p.clientId || p.guest
        const dateLabel = new Date(p.preferredDate).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
        return (
          <div key={p._id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{contact?.name || 'Unknown'}</p>
              <p className="text-xs text-ink/55">
                {dateLabel} · {p.address?.city}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[p.status] || 'bg-ink/5 text-ink/60'}`}
            >
              {STATUS_LABELS[p.status] || p.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [needsAttention, setNeedsAttention] = useState(null)
  const [pickups, setPickups] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStats()
      .then(({ stats: fetched, needsAttention: attention }) => {
        if (!cancelled) {
          setStats(fetched)
          setNeedsAttention(attention)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats({})
          setNeedsAttention([])
        }
      })
    fetchAllPickups()
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

  const weekBars = useMemo(() => (pickups ? buildWeekBars(pickups) : null), [pickups])

  return (
    <>
      <SEO title="Admin dashboard" description="Looppr operations overview." noindex />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map(({ key, label }) => (
          <div key={key} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {stats === null ? (
                <span className="inline-block h-7 w-16 animate-pulse rounded bg-linen-soft align-middle" />
              ) : (
                (stats[key] ?? 0)
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:items-start">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-7 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Today &amp; upcoming</h2>
              <p className="mt-1 text-sm text-ink/55">Active orders, soonest first.</p>
            </div>
            <Link to="/admin/jobs" className="text-sm font-semibold text-periwinkle-text hover:underline">
              Jobs &amp; Routes →
            </Link>
          </div>
          <div className="mt-5">
            <TodayAndUpcoming pickups={pickups} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-6">
            <h2 className="font-display text-base font-semibold text-ink">Orders this week</h2>
            <div className="mt-4 flex h-28 items-end gap-2.5">
              {weekBars === null
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                      <div className="w-full animate-pulse rounded-t-md bg-linen-soft" style={{ height: '40%' }} />
                    </div>
                  ))
                : weekBars.map((b, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <span className="text-xs font-semibold text-periwinkle-text">{b.val}</span>
                      <div
                        className="w-full rounded-t-md bg-periwinkle"
                        style={{ height: b.h }}
                      />
                      <span className="text-[10px] font-medium text-ink/50">{b.label}</span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="rounded-3xl bg-periwinkle p-6">
            <h2 className="text-sm font-semibold text-linen">Needs attention</h2>
            <div className="mt-3">
              <NeedsAttention orders={needsAttention} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
