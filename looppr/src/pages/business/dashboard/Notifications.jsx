import { useBusinessData } from '../../../context/BusinessDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import NotificationCard from '../../../components/business/NotificationCard'
import { pickupNotification } from '../../../components/business/businessUi'

export default function Notifications() {
  const { pickups, status } = useBusinessData()
  const notifications = pickups.map((p) => ({ id: p._id, ...pickupNotification(p) }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink/55">Status updates across all of your orders.</p>
      </div>

      <DashboardCard>
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationCard key={n.id} title={n.title} body={`${n.ref} · ${n.body}`} time={n.time} tone={n.tone} />
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
