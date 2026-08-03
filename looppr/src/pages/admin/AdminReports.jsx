import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/SEO'
import { fetchAllPickups } from '../../services/adminApi'

function currency(amount) {
  return `$${(amount || 0).toFixed(2)}`
}

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

// Paid-order revenue, bucketed into the last N calendar weeks (Sun–Sat).
// A different grouping than AdminDashboard's buildWeekBars (which buckets
// by weekday over the last 7 days), so kept as its own local helper rather
// than forcing a shared abstraction over two different bucket shapes.
function buildRevenueWeeks(pickups, weeksBack = 8) {
  const thisWeekStart = startOfWeek(new Date())
  const weeks = Array.from({ length: weeksBack }, (_, i) => {
    const start = new Date(thisWeekStart)
    start.setDate(start.getDate() - (weeksBack - 1 - i) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start, end }
  })

  const revenues = weeks.map(({ start, end }) =>
    pickups
      .filter((p) => p.paymentStatus === 'paid')
      .filter((p) => {
        const created = new Date(p.createdAt)
        return created >= start && created < end
      })
      .reduce((sum, p) => sum + (p.pricing?.amount || 0), 0),
  )
  const max = Math.max(1, ...revenues)

  return weeks.map((w, i) => ({
    label: w.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    val: revenues[i],
    h: `${Math.max(4, Math.round((revenues[i] / max) * 100))}%`,
  }))
}

function summarize(pickups) {
  const paid = pickups.filter((p) => p.paymentStatus === 'paid')
  const b2b = paid.filter((p) => p.source === 'business')
  const b2c = paid.filter((p) => p.source !== 'business')

  const sum = (list) => list.reduce((total, p) => total + (p.pricing?.amount || 0), 0)
  const totalRevenue = sum(paid)
  const b2bRevenue = sum(b2b)
  const b2cRevenue = sum(b2c)

  return {
    totalRevenue,
    b2bRevenue,
    b2cRevenue,
    avgOrderValue: paid.length ? totalRevenue / paid.length : 0,
    b2bOrders: b2b.length,
    b2cOrders: b2c.length,
  }
}

export default function AdminReports() {
  const [pickups, setPickups] = useState(null)

  useEffect(() => {
    let cancelled = false
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

  const stats = useMemo(() => (pickups ? summarize(pickups) : null), [pickups])
  const weeks = useMemo(() => (pickups ? buildRevenueWeeks(pickups) : null), [pickups])

  const segmentTotal = stats ? stats.b2cRevenue + stats.b2bRevenue : 0
  const b2cPct = segmentTotal ? Math.round((stats.b2cRevenue / segmentTotal) * 100) : 0
  const b2bPct = segmentTotal ? 100 - b2cPct : 0

  return (
    <>
      <SEO title="Reports" description="Revenue and order volume across Looppr." noindex />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total revenue', value: stats && currency(stats.totalRevenue) },
          { label: 'B2C revenue', value: stats && currency(stats.b2cRevenue) },
          { label: 'B2B revenue', value: stats && currency(stats.b2bRevenue) },
          { label: 'Avg. order value', value: stats && currency(stats.avgOrderValue) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {value ?? <span className="inline-block h-7 w-16 animate-pulse rounded bg-linen-soft align-middle" />}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:items-start">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-7 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold text-ink">Revenue by week</h2>
          <p className="mt-1 text-sm text-ink/55">Paid orders, last 8 calendar weeks.</p>
          <div className="mt-5 flex h-32 items-end gap-2.5">
            {weeks === null
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                    <div className="w-full animate-pulse rounded-t-md bg-linen-soft" style={{ height: '40%' }} />
                  </div>
                ))
              : weeks.map((w, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[10px] font-semibold text-periwinkle-text">
                      {w.val > 0 ? currency(w.val) : ''}
                    </span>
                    <div className="w-full rounded-t-md bg-periwinkle" style={{ height: w.h }} />
                    <span className="text-[10px] font-medium text-ink/50">{w.label}</span>
                  </div>
                ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-base font-semibold text-ink">B2C vs. B2B</h2>
          <p className="mt-1 text-xs text-ink/55">Share of revenue from paid orders.</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>B2C</span>
                <span className="text-ink/50">
                  {stats ? `${stats.b2cOrders} orders · ${b2cPct}%` : '—'}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-linen">
                <div className="h-full rounded-full bg-periwinkle" style={{ width: `${b2cPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>B2B</span>
                <span className="text-ink/50">
                  {stats ? `${stats.b2bOrders} orders · ${b2bPct}%` : '—'}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-linen">
                <div className="h-full rounded-full bg-success" style={{ width: `${b2bPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
