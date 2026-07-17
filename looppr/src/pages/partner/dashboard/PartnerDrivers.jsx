import DashboardCard from '../../../components/business/DashboardCard'

// Drivers are dispatched by Looppr (the Rider fleet), not managed by the
// partner directly — so this is informational until partner-owned drivers
// are supported.
export default function PartnerDrivers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Drivers</h1>
        <p className="mt-1 text-sm text-ink/55">Pickup and delivery drivers assigned to your orders.</p>
      </div>

      <DashboardCard>
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-ink/70">Looppr handles driver dispatch for you.</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
            Drivers from the Looppr network are automatically assigned to collect and deliver your
            orders. Assigned drivers will appear here for each active job as dispatch goes live.
          </p>
        </div>
      </DashboardCard>
    </div>
  )
}
