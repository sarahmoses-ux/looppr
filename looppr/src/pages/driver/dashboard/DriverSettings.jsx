import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDriverAuth } from '../../../context/DriverAuthContext'
import DashboardCard from '../../../components/business/DashboardCard'
import { updateAvailability } from '../../../services/driverDashboardApi'

export default function DriverSettings() {
  const { driver, setDriver } = useDriverAuth()
  const [busy, setBusy] = useState(false)
  const online = driver?.availability === 'available' || driver?.availability === 'on_delivery'

  async function toggle() {
    setBusy(true)
    try {
      const { driver: updated } = await updateAvailability(online ? 'offline' : 'online')
      setDriver(updated)
    } finally {
      setBusy(false)
    }
  }

  const statusPill = {
    active: 'bg-success-soft text-success-dark',
    pending: 'bg-amber-50 text-amber-700',
    suspended: 'bg-red-50 text-red-600',
    inactive: 'bg-ink/5 text-ink/60',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/55">Account status and availability.</p>
      </div>

      <DashboardCard title="Account">
        <dl className="divide-y divide-line text-sm">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <dt className="text-ink/55">Name</dt>
            <dd className="font-semibold text-ink">{driver?.name}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-ink/55">Email</dt>
            <dd className="text-ink/80">{driver?.email}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-ink/55">Account status</dt>
            <dd><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusPill[driver?.accountStatus] || statusPill.inactive}`}>{driver?.accountStatus}</span></dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-ink/55">Email verified</dt>
            <dd className="font-medium text-ink/80">{driver?.isVerified ? 'Yes' : 'No'}</dd>
          </div>
          <div className="flex items-center justify-between py-3 last:pb-0">
            <dt className="text-ink/55">Profile</dt>
            <dd><Link to="/drive/dashboard/profile" className="font-semibold text-sky-600 hover:text-sky-700">Edit profile →</Link></dd>
          </div>
        </dl>
      </DashboardCard>

      <DashboardCard title="Availability">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink/80">Accepting new deliveries</p>
            <p className="text-xs text-ink/50">
              When offline, you won't receive new deliveries and your location isn't shared.
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${online ? 'bg-success-soft text-success-dark' : 'bg-ink/5 text-ink/60'}`}
            aria-pressed={online}
          >
            <span className={`h-2 w-2 rounded-full ${online ? 'bg-success' : 'bg-ink/40'}`} />
            {online ? 'Online' : 'Offline'}
          </button>
        </div>
        {online && (
          <p className="mt-3 text-xs text-ink/45">
            {driver?.locationUpdatedAt
              ? `Location last shared ${new Date(driver.locationUpdatedAt).toLocaleTimeString()}.`
              : "Waiting for your browser's location permission…"}
          </p>
        )}
      </DashboardCard>
    </div>
  )
}
