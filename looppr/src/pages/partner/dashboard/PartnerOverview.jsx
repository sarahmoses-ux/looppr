import { Link } from 'react-router-dom'
import { usePartnerData } from '../../../context/PartnerDataContext'
import StatCard from '../../../components/business/StatCard'
import DashboardCard from '../../../components/business/DashboardCard'
import NotificationCard from '../../../components/business/NotificationCard'
import OrderCard from '../../../components/partner/OrderCard'
import RejectReasonModal from '../../../components/partner/RejectReasonModal'
import { usePartnerOrders } from '../../../components/partner/usePartnerOrders'
import {
  ACTIVE_STAGES,
  formatCurrency,
  formatDate,
  stageMeta,
  stageOf,
  WINDOW_LABELS,
} from '../../../components/partner/partnerUi'

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{path}</svg>
  )
}

export default function PartnerOverview() {
  const { overview, incoming, myOrders, earnings, status } = usePartnerData()
  const { accept, requestReject, rejectTarget, confirmReject, cancelReject } = usePartnerOrders()

  if (status === 'loading') return <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/60" />
  if (status === 'error') {
    return <DashboardCard><p className="text-center text-sm text-ink/55">Couldn't load your dashboard. Please refresh.</p></DashboardCard>
  }

  const o = overview || {}
  const today = new Date().toDateString()
  const todaysPickups = myOrders
    .filter((p) => ACTIVE_STAGES.includes(stageOf(p)) && new Date(p.preferredDate).toDateString() === today)
  const activeJobs = myOrders.filter((p) => ACTIVE_STAGES.includes(stageOf(p)))
  const notifications = myOrders.slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/55">Your laundromat at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="New Orders" value={o.newOrders ?? 0} hint="Available to claim" accent="sky" icon={<Icon path={<><path d="M4 4h16v5H4zM4 13h16v7H4z" /></>} />} />
        <StatCard label="Active Orders" value={o.activeOrders ?? 0} hint="In progress" accent="violet" icon={<Icon path={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />} />
        <StatCard label="Completed" value={o.completedOrders ?? 0} hint="Delivered" accent="success" icon={<Icon path={<path d="M20 6 9 17l-5-5" />} />} />
        <StatCard label="Monthly Revenue" value={formatCurrency(o.monthlyRevenue)} hint="Paid this month" accent="amber" icon={<Icon path={<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />} />} />
        <StatCard label="Avg. Rating" value={o.averageRating != null ? `${o.averageRating.toFixed(1)}★` : 'New'} hint="Customer rating" accent="sky" icon={<Icon path={<path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.3 1.6-6.8L2.2 8.9l6.9-.6z" />} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Incoming Orders"
          subtitle={incoming.length ? `${incoming.length} available to claim` : undefined}
          className="lg:col-span-2"
          action={<Link to="/partners/dashboard/incoming" className="text-sm font-semibold text-sky-600 hover:text-sky-700">View all</Link>}
        >
          {incoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/45">No new orders right now. Toggle Online to receive orders.</p>
          ) : (
            <div className="space-y-3">
              {incoming.slice(0, 3).map((order) => (
                <OrderCard key={order._id} order={order} onAccept={accept} onReject={requestReject} />
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Notifications">
          {notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/45">You're all caught up.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((p) => {
                const meta = stageMeta(p)
                const tone = { sky: 'sky', indigo: 'sky', amber: 'amber', violet: 'violet', cyan: 'sky', success: 'success' }
                return (
                  <NotificationCard
                    key={p._id}
                    title={meta.label}
                    body={`${p.customerName} · ${formatDate(p.preferredDate)}`}
                    tone={tone[stageOf(p) === 'delivered' ? 'success' : stageOf(p) === 'laundry_in_progress' ? 'violet' : stageOf(p) === 'pickup_completed' ? 'amber' : 'sky']}
                  />
                )
              })}
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Today's Pickup Schedule"
          className="lg:col-span-2"
          action={<Link to="/partners/dashboard/schedule" className="text-sm font-semibold text-sky-600 hover:text-sky-700">Full schedule</Link>}
        >
          {todaysPickups.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/45">No pickups scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todaysPickups.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.customerName}</p>
                    <p className="text-xs text-ink/50">{WINDOW_LABELS[p.window]} · {p.address?.city}</p>
                  </div>
                  <span className="text-xs font-medium text-ink/50">{stageMeta(p).label}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Earnings Summary" action={<Link to="/partners/dashboard/earnings" className="text-sm font-semibold text-sky-600 hover:text-sky-700">Details</Link>}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink/55">This week</dt><dd className="font-semibold text-ink">{formatCurrency(earnings?.weeklyRevenue)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">This month</dt><dd className="font-semibold text-ink">{formatCurrency(earnings?.monthlyRevenue)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/55">Pending</dt><dd className="font-semibold text-amber-600">{formatCurrency(earnings?.pendingPayments)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3"><dt className="text-ink/55">Total revenue</dt><dd className="font-semibold text-ink">{formatCurrency(earnings?.totalRevenue)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-ink/45">{activeJobs.length} active job{activeJobs.length === 1 ? '' : 's'} in progress.</p>
        </DashboardCard>
      </div>

      <RejectReasonModal order={rejectTarget} onConfirm={confirmReject} onClose={cancelReject} />
    </div>
  )
}
