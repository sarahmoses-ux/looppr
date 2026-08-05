import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import RejectApplicationModal from '../../components/admin/RejectApplicationModal'
import { useToast } from '../../context/ToastContext'
import {
  approveDriverApplication,
  approvePartnerApplication,
  fetchDriverApplications,
  fetchPartnerApplications,
  rejectDriverApplication,
  rejectPartnerApplication,
  updateDriverStatus,
  updatePartnerStatus,
} from '../../services/adminApi'

const STATUS_BADGE = {
  pending: 'bg-periwinkle-soft text-periwinkle-text',
  active: 'bg-success-soft text-success-dark',
  rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-red-50 text-red-600',
  inactive: 'bg-ink/5 text-ink/50',
}

const STATUS_LABEL = {
  pending: 'Pending',
  active: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
  inactive: 'Inactive',
}

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

// operatingHours is [{ day, open, close, closed }], not a string — condense
// consecutive open days sharing the same hours into one range (e.g. "Mon–Fri
// 8:00–20:00") rather than a line per day.
function formatOperatingHours(operatingHours) {
  if (!operatingHours?.length) return null
  const segments = []
  let run = null
  for (const { day, open, close, closed } of operatingHours) {
    const label = closed ? 'Closed' : `${open || '?'}–${close || '?'}`
    if (run && run.label === label) {
      run.end = day
    } else {
      run = { start: day, end: day, label }
      segments.push(run)
    }
  }
  return segments
    .map((s) => `${DAY_LABELS[s.start]}${s.end !== s.start ? `–${DAY_LABELS[s.end]}` : ''} ${s.label}`)
    .join(', ')
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ApplicationRow({ application, type, onApprove, onReject, onSuspend, onReactivate }) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)
  const isPartner = type === 'partner'
  const name = isPartner ? application.ownerName : application.name
  const applicantLabel = isPartner ? application.businessName : application.name

  async function handleApprove() {
    setBusy(true)
    try {
      await onApprove(application.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not approve. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleSuspend() {
    setBusy(true)
    try {
      await onSuspend(application.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not suspend. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleReactivate() {
    setBusy(true)
    try {
      await onReactivate(application.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not reactivate. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const photo = isPartner ? application.logo : application.profilePhoto

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {photo && (
          <img src={photo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-line object-cover" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-ink">
            {name}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[application.accountStatus] || 'bg-ink/5 text-ink/50'}`}>
              {STATUS_LABEL[application.accountStatus] || application.accountStatus}
            </span>
          </p>
          {isPartner && <p className="mt-0.5 text-sm text-ink/70">{application.businessName}</p>}
          {!isPartner && (
            <p className="mt-0.5 text-sm text-ink/70">
              {application.vehicleType}
              {application.vehicleName ? ` — ${application.vehicleName}` : ''}
            </p>
          )}
          <p className="mt-0.5 text-sm text-ink/55">
            {application.email} · {application.phone}
          </p>
          <p className="mt-0.5 text-sm text-ink/55">
            {application.city}, {application.state} · Applied {formatDate(application.createdAt)}
          </p>

          {isPartner && application.description && (
            <p className="mt-1.5 max-w-md text-xs text-ink/60">{application.description}</p>
          )}
          {isPartner && (application.yearsInBusiness || application.employeeCount || application.operatingHours?.length > 0) && (
            <p className="mt-0.5 text-xs text-ink/45">
              {[
                application.yearsInBusiness ? `${application.yearsInBusiness} yrs in business` : null,
                application.employeeCount ? `${application.employeeCount} employees` : null,
                formatOperatingHours(application.operatingHours),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {isPartner && application.servicesOffered?.length > 0 && (
            <p className="mt-0.5 text-xs text-ink/45">Services: {application.servicesOffered.join(', ')}</p>
          )}
          {isPartner && (
            <p className="mt-0.5 text-xs text-ink/45">
              {application.pickupAvailable ? 'Pickup ✓' : 'No pickup'} ·{' '}
              {application.deliveryAvailable ? 'Delivery ✓' : 'No delivery'}
            </p>
          )}
          {!isPartner && (application.licenseNumber || application.vehiclePlate) && (
            <p className="mt-1.5 text-xs text-ink/45">
              {[
                application.licenseNumber ? `License ${application.licenseNumber}` : null,
                application.vehiclePlate ? `Plate ${application.vehiclePlate}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          {(application.accountStatus === 'active' || application.accountStatus === 'suspended') && (
            <p className="mt-1.5 text-xs font-medium text-ink/45">
              {isPartner
                ? `Capacity ${application.maxDailyCapacity ?? '—'}/day · ${application.activeOrderCount ?? 0} active order${application.activeOrderCount === 1 ? '' : 's'}`
                : `Capacity ${application.maxActiveDeliveries ?? '—'} deliveries · ${application.activeDeliveryCount ?? 0} active`}
              {' · '}
              {application.availability === 'online' || application.availability === 'available'
                ? 'Online'
                : application.availability === 'on_delivery'
                  ? 'On delivery'
                  : 'Offline'}
            </p>
          )}
        </div>
      </div>

      {application.accountStatus === 'pending' && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={busy}
            className="rounded-full bg-success-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Approving…' : 'Approve'}
          </button>
          <button
            type="button"
            onClick={() => onReject(application, applicantLabel)}
            disabled={busy}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {application.accountStatus === 'active' && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleSuspend}
            disabled={busy}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? 'Suspending…' : 'Suspend'}
          </button>
        </div>
      )}

      {application.accountStatus === 'suspended' && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleReactivate}
            disabled={busy}
            className="rounded-full bg-success-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Reactivating…' : 'Reactivate'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminApplications() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('partners')
  const [partners, setPartners] = useState(null)
  const [drivers, setDrivers] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectTarget, setRejectTarget] = useState(null) // { application, applicantLabel }

  useEffect(() => {
    let cancelled = false
    const filters = { search: search || undefined, status: statusFilter || undefined }

    if (tab === 'partners') {
      fetchPartnerApplications(filters)
        .then(({ partners: list }) => {
          if (!cancelled) setPartners(list)
        })
        .catch(() => {
          if (!cancelled) setPartners([])
        })
    } else {
      fetchDriverApplications(filters)
        .then(({ drivers: list }) => {
          if (!cancelled) setDrivers(list)
        })
        .catch(() => {
          if (!cancelled) setDrivers([])
        })
    }
    return () => {
      cancelled = true
    }
  }, [tab, search, statusFilter])

  function replaceInList(setList, updated) {
    setList((list) => (list ? list.map((a) => (a.id === updated.id ? updated : a)) : list))
  }

  async function handleApprovePartner(id) {
    const { partner } = await approvePartnerApplication(id)
    replaceInList(setPartners, partner)
  }

  async function handleApproveDriver(id) {
    const { driver } = await approveDriverApplication(id)
    replaceInList(setDrivers, driver)
  }

  async function handleSuspendPartner(id) {
    const { partner } = await updatePartnerStatus(id, 'suspended')
    replaceInList(setPartners, partner)
  }

  async function handleReactivatePartner(id) {
    const { partner } = await updatePartnerStatus(id, 'active')
    replaceInList(setPartners, partner)
  }

  async function handleSuspendDriver(id) {
    const { driver } = await updateDriverStatus(id, 'suspended')
    replaceInList(setDrivers, driver)
  }

  async function handleReactivateDriver(id) {
    const { driver } = await updateDriverStatus(id, 'active')
    replaceInList(setDrivers, driver)
  }

  async function handleRejectConfirm(reason) {
    const { application, type } = rejectTarget
    try {
      if (type === 'partner') {
        const { partner } = await rejectPartnerApplication(application.id, reason)
        replaceInList(setPartners, partner)
      } else {
        const { driver } = await rejectDriverApplication(application.id, reason)
        replaceInList(setDrivers, driver)
      }
      setRejectTarget(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not reject. Please try again.', 'error')
      throw err
    }
  }

  const list = tab === 'partners' ? partners : drivers

  return (
    <>
      <SEO title="Applications" description="Review Partner and Driver applications." noindex />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-linen p-1">
          {[
            { value: 'partners', label: 'Partners' },
            { value: 'drivers', label: 'Drivers' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.value ? 'bg-white text-ink shadow-sm' : 'text-ink/55'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or city…"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {list === null ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : list.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No applications match your filters.</p>
        ) : (
          <div className="space-y-3">
            {list.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                type={tab === 'partners' ? 'partner' : 'driver'}
                onApprove={tab === 'partners' ? handleApprovePartner : handleApproveDriver}
                onReject={(app, applicantLabel) =>
                  setRejectTarget({ application: app, applicantLabel, type: tab === 'partners' ? 'partner' : 'driver' })
                }
                onSuspend={tab === 'partners' ? handleSuspendPartner : handleSuspendDriver}
                onReactivate={tab === 'partners' ? handleReactivatePartner : handleReactivateDriver}
              />
            ))}
          </div>
        )}
      </div>

      <RejectApplicationModal
        application={rejectTarget?.application}
        applicantLabel={rejectTarget?.applicantLabel}
        onConfirm={handleRejectConfirm}
        onClose={() => setRejectTarget(null)}
      />
    </>
  )
}
