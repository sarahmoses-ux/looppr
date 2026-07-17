import { useOutletContext } from 'react-router-dom'
import { useBusinessData } from '../../../context/BusinessDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import StatusBadge from '../../../components/business/StatusBadge'
import Button from '../../../components/Button'
import { ACTIVE_STATUSES, formatDate, LOAD_SIZE_LABELS, orderRef, WINDOW_LABELS } from '../../../components/business/businessUi'

export default function PickupSchedule() {
  const { pickups, status } = useBusinessData()
  const { openPickup } = useOutletContext()

  const today = new Date(new Date().toDateString())
  const upcoming = pickups
    .filter((p) => ACTIVE_STATUSES.includes(p.status) && new Date(p.preferredDate) >= today)
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Pickup Schedule</h1>
          <p className="mt-1 text-sm text-ink/55">Your upcoming scheduled pickups, soonest first.</p>
        </div>
        <Button onClick={openPickup} variant="primary" className="px-5! py-2.5! text-sm!">Schedule pickup</Button>
      </div>

      <DashboardCard>
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : upcoming.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">No upcoming pickups. Schedule one to see it here.</p>
        ) : (
          <ol className="relative space-y-4 pl-6">
            <span className="absolute left-2 top-2 bottom-2 w-px bg-line" aria-hidden="true" />
            {upcoming.map((p) => (
              <li key={p._id} className="relative">
                <span className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-sky-500 ring-1 ring-sky-200" aria-hidden="true" />
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{formatDate(p.preferredDate, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-ink/50">
                      {WINDOW_LABELS[p.window]} · {LOAD_SIZE_LABELS[p.loadSize]} · {p.address?.street}, {p.address?.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-ink/45">{orderRef(p._id)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </DashboardCard>
    </div>
  )
}
