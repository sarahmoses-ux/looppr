import { Link, useOutletContext } from 'react-router-dom'
import { useBusinessData } from '../../../context/BusinessDataContext'
import StatCard from '../../../components/business/StatCard'
import DashboardCard from '../../../components/business/DashboardCard'
import StatusBadge from '../../../components/business/StatusBadge'
import NotificationCard from '../../../components/business/NotificationCard'
import OrdersTable from '../../../components/business/OrdersTable'
import {
  ACTIVE_STATUSES,
  formatCurrency,
  formatDate,
  orderRef,
  pickupNotification,
  WINDOW_LABELS,
} from '../../../components/business/businessUi'

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  )
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-ink/45">
        {children}
      </td>
    </tr>
  )
}

export default function Overview() {
  const { overview, pickups, status } = useBusinessData()
  const { openPickup } = useOutletContext()

  if (status === 'loading') {
    return <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/60" />
  }
  if (status === 'error') {
    return (
      <DashboardCard>
        <p className="text-center text-sm text-ink/55">Couldn't load your dashboard. Please refresh.</p>
      </DashboardCard>
    )
  }

  const o = overview || {}
  const upcoming = pickups
    .filter((p) => ACTIVE_STATUSES.includes(p.status) && new Date(p.preferredDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))
    .slice(0, 4)
  const active = pickups.filter((p) => ACTIVE_STATUSES.includes(p.status))
  const recent = pickups.slice(0, 5)
  const invoices = pickups.filter((p) => p.paymentStatus === 'paid').slice(0, 4)
  const notifications = pickups.slice(0, 4).map(pickupNotification)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Overview</h1>
          <p className="mt-1 text-sm text-ink/55">Your commercial laundry at a glance.</p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Completed Orders" value={o.completedOrders ?? 0} hint="Delivered all-time" accent="success" icon={<Icon path={<path d="M20 6 9 17l-5-5" />} />} />
        <StatCard
          label="Upcoming Pickup"
          value={o.upcomingPickup ? formatDate(o.upcomingPickup.preferredDate, { month: 'short', day: 'numeric' }) : '—'}
          hint={o.upcomingPickup ? WINDOW_LABELS[o.upcomingPickup.window] : 'None scheduled'}
          accent="amber"
          icon={<Icon path={<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>} />}
        />
        <StatCard label="Monthly Spending" value={formatCurrency(o.monthlySpending)} hint="Paid this month" accent="violet" icon={<Icon path={<><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>} />} />
      </div>

      {/* Active orders — shown in full here (replaces the old count card) */}
      <DashboardCard
        title="Active Order"
        subtitle={active.length ? `${active.length} order${active.length === 1 ? '' : 's'} in progress` : undefined}
        action={<button type="button" onClick={openPickup} className="text-sm font-semibold text-sky-600 hover:text-sky-700">+ Request pickup</button>}
      >
        <div className="-mx-5 -my-5">
          <OrdersTable pickups={active} emptyLabel="No active orders right now. Request a pickup to get started." />
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <DashboardCard
          title="Recent Activity"
          className="lg:col-span-2"
          action={<Link to="/business/dashboard/requests" className="text-sm font-semibold text-sky-600 hover:text-sky-700">View all</Link>}
        >
          <div className="-mx-5 -my-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Pickup date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.length === 0 ? (
                  <EmptyRow colSpan={4}>No orders yet. Request your first pickup to get started.</EmptyRow>
                ) : (
                  recent.map((p) => (
                    <tr key={p._id} className="transition-colors hover:bg-linen/60">
                      <td className="px-5 py-3 font-semibold text-ink">{orderRef(p._id)}</td>
                      <td className="px-5 py-3 text-ink/70">{formatDate(p.preferredDate)}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-right font-medium text-ink/80">{formatCurrency(p.pricing?.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* Notifications */}
        <DashboardCard title="Notifications">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/45">You're all caught up.</p>
            ) : (
              notifications.map((n, i) => (
                <NotificationCard key={i} title={n.title} body={`${n.ref} · ${n.body}`} time={n.time} tone={n.tone} />
              ))
            )}
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming pickups */}
        <DashboardCard
          title="Upcoming Pickups"
          action={<button type="button" onClick={openPickup} className="text-sm font-semibold text-sky-600 hover:text-sky-700">+ New</button>}
        >
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/45">No upcoming pickups scheduled.</p>
            ) : (
              upcoming.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{formatDate(p.preferredDate)}</p>
                    <p className="text-xs text-ink/50">{WINDOW_LABELS[p.window]} · {p.address?.city}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        {/* Recent invoices */}
        <DashboardCard
          title="Recent Invoices"
          action={<Link to="/business/dashboard/invoices" className="text-sm font-semibold text-sky-600 hover:text-sky-700">View all</Link>}
        >
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/45">No paid invoices yet.</p>
            ) : (
              invoices.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Invoice {orderRef(p._id)}</p>
                    <p className="text-xs text-ink/50">Paid {formatDate(p.paidAt || p.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink">{formatCurrency(p.pricing?.amount)}</span>
                    <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-dark">Paid</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
