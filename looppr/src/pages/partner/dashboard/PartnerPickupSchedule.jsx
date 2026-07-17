import { usePartnerData } from '../../../context/PartnerDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import StageBadge from '../../../components/partner/StageBadge'
import { ACTIVE_STAGES, formatDate, stageOf, WINDOW_LABELS, formatAddress } from '../../../components/partner/partnerUi'

export default function PartnerPickupSchedule() {
  const { myOrders, status } = usePartnerData()
  const today = new Date(new Date().toDateString())
  const upcoming = myOrders
    .filter((o) => ACTIVE_STAGES.includes(stageOf(o)) && new Date(o.preferredDate) >= today)
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Pickup Schedule</h1>
        <p className="mt-1 text-sm text-ink/55">Upcoming pickups for jobs you've accepted, soonest first.</p>
      </div>

      <DashboardCard>
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : upcoming.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">No upcoming pickups scheduled.</p>
        ) : (
          <ol className="relative space-y-4 pl-6">
            <span className="absolute left-2 top-2 bottom-2 w-px bg-line" aria-hidden="true" />
            {upcoming.map((o) => (
              <li key={o._id} className="relative">
                <span className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-sky-500 ring-1 ring-sky-200" aria-hidden="true" />
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{formatDate(o.preferredDate, { weekday: 'short', month: 'short', day: 'numeric' })} · {o.customerName}</p>
                    <p className="text-xs text-ink/50">{WINDOW_LABELS[o.window]} · {formatAddress(o.address)}</p>
                  </div>
                  <StageBadge order={o} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </DashboardCard>
    </div>
  )
}
