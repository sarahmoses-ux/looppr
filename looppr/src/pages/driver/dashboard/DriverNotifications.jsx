import { useDriverData } from '../../../context/DriverDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import NotificationCard from '../../../components/business/NotificationCard'
import { formatDate, orderRef, stageMeta, stageOf } from '../../../components/driver/driverUi'

const TONE = {
  new: 'sky', assigned: 'sky', pickup_completed: 'amber',
  at_laundromat: 'violet', out_for_delivery: 'sky', delivered: 'success',
}

export default function DriverNotifications() {
  const { incoming, myDeliveries, status } = useDriverData()

  // New incoming deliveries + your in-flight deliveries, most recent first.
  const items = [
    ...incoming.map((d) => ({ ...d, kind: 'incoming' })),
    ...myDeliveries,
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink/55">New deliveries and status updates across your route.</p>
      </div>

      <DashboardCard>
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((d) => {
              const meta = stageMeta(d)
              const title = d.kind === 'incoming' ? 'New delivery available' : meta.label
              return (
                <NotificationCard
                  key={d._id}
                  title={title}
                  body={`${orderRef(d._id)} · ${d.customerName} · ${formatDate(d.preferredDate)}`}
                  tone={d.kind === 'incoming' ? 'sky' : TONE[stageOf(d)]}
                />
              )
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
