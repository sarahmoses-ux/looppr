import { usePartnerData } from '../../../context/PartnerDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import NotificationCard from '../../../components/business/NotificationCard'
import { formatDate, orderRef, stageMeta, stageOf } from '../../../components/partner/partnerUi'

const TONE = {
  new: 'sky', accepted: 'sky', pickup_completed: 'amber',
  laundry_in_progress: 'violet', ready_for_delivery: 'sky', delivered: 'success',
}

export default function PartnerNotifications() {
  const { incoming, myOrders, status } = usePartnerData()

  // New incoming orders + your in-flight jobs, most recent first.
  const items = [
    ...incoming.map((o) => ({ ...o, kind: 'incoming' })),
    ...myOrders,
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink/55">New orders and status updates across your jobs.</p>
      </div>

      <DashboardCard>
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((o) => {
              const meta = stageMeta(o)
              const title = o.kind === 'incoming' ? 'New order available' : meta.label
              return (
                <NotificationCard
                  key={o._id}
                  title={title}
                  body={`${orderRef(o._id)} · ${o.customerName} · ${formatDate(o.preferredDate)}`}
                  tone={o.kind === 'incoming' ? 'sky' : TONE[stageOf(o)]}
                />
              )
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
