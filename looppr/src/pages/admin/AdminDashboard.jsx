import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { STATUS_LABELS } from '../../constants/orderStatus'
import { fetchStats } from '../../services/adminApi'

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

const STAT_CARDS = [
  { key: 'totalCustomers', label: 'Total customers' },
  { key: 'totalOrders', label: 'Total orders' },
  { key: 'activeOrders', label: 'Active orders' },
  { key: 'completedOrders', label: 'Completed orders' },
  { key: 'cancelledOrders', label: 'Cancelled orders' },
  { key: 'revenue', label: 'Revenue', money: true },
]

const STATUS_STYLES = {
  requested: 'bg-periwinkle-soft text-periwinkle-text',
  pending_review: 'bg-periwinkle-soft text-periwinkle-text',
  awaiting_payment: 'bg-ink/5 text-ink/60',
}

function NeedsAttention({ orders }) {
  if (orders === null) {
    return (
      <div className="mt-8 space-y-3">
        <div className="h-14 animate-pulse rounded-2xl bg-linen-soft" />
        <div className="h-14 animate-pulse rounded-2xl bg-linen-soft" />
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Needs attention</h2>
          <p className="mt-1 text-sm text-ink/55">
            Orders that haven't moved past request review or payment yet.
          </p>
        </div>
        {orders.length > 0 && (
          <Link to="/admin/orders" className="text-sm font-semibold text-periwinkle-text hover:underline">
            View all
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink/55">Nothing needs attention right now.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => {
            const contact = o.clientId || o.guest
            const dateLabel = new Date(o.preferredDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
            return (
              <Link
                key={o._id}
                to="/admin/orders"
                className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3 transition-colors hover:border-periwinkle-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{contact?.name || 'Unknown'}</p>
                  <p className="text-xs text-ink/50">{dateLabel}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[o.status] || 'bg-ink/5 text-ink/60'}`}
                >
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [needsAttention, setNeedsAttention] = useState(null)

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
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Admin dashboard" description="Looppr business overview." noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Overview
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map(({ key, label, money }) => (
          <div key={key} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {stats === null ? (
                <span className="inline-block h-7 w-16 animate-pulse rounded bg-linen-soft align-middle" />
              ) : money ? (
                formatMoney(stats[key])
              ) : (
                (stats[key] ?? 0)
              )}
            </p>
          </div>
        ))}
      </div>

      <NeedsAttention orders={needsAttention} />
    </div>
  )
}
