import AdminOrderDetails from '../../components/admin/AdminOrderDetails'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../../components/SEO'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { effectiveAdminRole } from '../../constants/adminRoles'
import { ALL_STATUSES } from '../../constants/orderStatus'
import {
  assignDriverToOrder,
  assignPartnerToOrder,
  fetchAllPickups,
  fetchDriverApplications,
  fetchPartnerApplications,
  updateOrderStatus,
} from '../../services/adminApi'

// Partner Portal lifecycle labels — mirrors the partner-side stages so admins
// see exactly what a laundromat has done with an order.
const PARTNER_STAGE_LABELS = {
  accepted: 'Accepted',
  pickup_completed: 'Pickup completed',
  laundry_in_progress: 'Laundry in progress',
  ready_for_delivery: 'Ready for delivery',
  delivered: 'Delivered',
}

// Driver Portal lifecycle labels — mirrors the driver-side stages so admins
// see exactly what a driver has done with a delivery.
const DRIVER_STAGE_LABELS = {
  assigned: 'Driver assigned',
  pickup_completed: 'Pickup completed',
  at_laundromat: 'At laundromat',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
}

function AdminOrderRow({ pickup, onChange, partners, drivers, readOnly }) {
  const { showToast } = useToast()
  const notificationsOff = pickup.source === 'account' && pickup.clientId?.emailNotifications === false

  async function handleStatusChange(e) {
    const status = e.target.value
    try {
      const { pickup: updated } = await updateOrderStatus(pickup._id, status)
      onChange(updated)
    } catch {
      // The <select> reverts on next render since we never applied an
      // optimistic update — still worth telling the admin it didn't save.
      showToast('Could not update order status. Please try again.', 'error')
    }
  }

  async function handleAssignPartner(e) {
    const partnerUserId = e.target.value
    if (!partnerUserId) return
    try {
      const { pickup: updated } = await assignPartnerToOrder(pickup._id, partnerUserId)
      onChange(updated)
    } catch {
      showToast('Could not assign a partner. Please try again.', 'error')
    }
  }

  async function handleAssignDriver(e) {
    const driverUserId = e.target.value
    if (!driverUserId) return
    try {
      const { pickup: updated } = await assignDriverToOrder(pickup._id, driverUserId)
      onChange(updated)
    } catch {
      showToast('Could not assign a driver. Please try again.', 'error')
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line px-5 py-4">
      <AdminOrderDetails pickup={pickup} />
      <div className="flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {/* Partner Portal attribution — reflects any accept/advance action a
            laundromat took on this order. */}
        {pickup.partnerUserId ? (
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
              Partner: {pickup.partnerUserId.businessName}
            </span>
            {pickup.partnerUserId.isDefaultLaundromat && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                In-House
              </span>
            )}
            {pickup.partnerStage && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 font-semibold text-ink/60">
                {PARTNER_STAGE_LABELS[pickup.partnerStage] || pickup.partnerStage}
              </span>
            )}
          </p>
        ) : (
          pickup.partnerRejectedBy?.length > 0 && (
            <p className="mt-1.5 text-xs font-medium text-ink/45">
              Unclaimed · {pickup.partnerRejectedBy.length} partner rejection{pickup.partnerRejectedBy.length === 1 ? '' : 's'}
            </p>
          )
        )}
        {partners?.length > 0 && !readOnly && (
          <select
            value=""
            onChange={handleAssignPartner}
            className="mt-1.5 rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink/70 outline-none focus:border-periwinkle"
          >
            <option value="">{pickup.partnerUserId ? 'Reassign partner…' : 'Assign partner…'}</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.businessName}
              </option>
            ))}
          </select>
        )}

        {/* Driver Portal attribution — reflects any accept/advance/weight
            action a driver took on this delivery. */}
        {pickup.driverUserId ? (
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">
              Driver: {pickup.driverUserId.name}
            </span>
            {pickup.driverStage && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 font-semibold text-ink/60">
                {DRIVER_STAGE_LABELS[pickup.driverStage] || pickup.driverStage}
              </span>
            )}
          </p>
        ) : (
          pickup.driverRejectedBy?.length > 0 && (
            <p className="mt-1.5 text-xs font-medium text-ink/45">
              Unclaimed · {pickup.driverRejectedBy.length} driver rejection{pickup.driverRejectedBy.length === 1 ? '' : 's'}
            </p>
          )
        )}
        {drivers?.length > 0 && !readOnly && (
          <select
            value=""
            onChange={handleAssignDriver}
            className="mt-1.5 rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink/70 outline-none focus:border-periwinkle"
          >
            <option value="">{pickup.driverUserId ? 'Reassign driver…' : 'Assign driver…'}</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {notificationsOff && <p className="mt-2 text-xs text-ink/50">Notifications off</p>}

      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <select
          aria-label="Order status" value={pickup.status}
          onChange={handleStatusChange}
          disabled={readOnly}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-periwinkle disabled:opacity-50"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const { user } = useAuth()
  // Support has read-only access to Orders (see requireAdminRole('ops') on
  // the mutation routes in adminRoutes.js) — disable rather than hide the
  // controls so support can still see current status/assignment at a glance.
  const readOnly = effectiveAdminRole(user) === 'support'

  // Seeded from ?search= so the admin header search box can deep-link here.
  const [searchParams] = useSearchParams()
  const [pickups, setPickups] = useState(null)
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [partners, setPartners] = useState([])
  const [drivers, setDrivers] = useState([])

  // Fetched once, independent of the pickups filters above — powers the
  // assign/reassign selects on each row.
  useEffect(() => {
    fetchPartnerApplications({ status: 'active' })
      .then(({ partners: list }) => setPartners(list))
      .catch(() => {})
    fetchDriverApplications({ status: 'active' })
      .then(({ drivers: list }) => setDrivers(list))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    // Deliberately not resetting to null here — keep the current list
    // visible (stale-while-revalidating) instead of flashing the skeleton
    // loader on every keystroke/filter change.
    fetchAllPickups({
      search: search || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentFilter || undefined,
    })
      .then(({ pickups: list }) => {
        if (!cancelled) setPickups(list)
      })
      .catch(() => {
        if (!cancelled) setPickups([])
      })
    return () => {
      cancelled = true
    }
  }, [search, statusFilter, paymentFilter])

  function handleChange(updated) {
    setPickups((list) => list.map((p) => (p._id === updated._id ? updated : p)))
  }

  return (
    <>
      <SEO title="Orders" description="All Looppr laundry orders." noindex />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or address…"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        >
          <option value="">All payment statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {pickups === null ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : pickups.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No orders match your filters.</p>
        ) : (
          <div className="space-y-3">
            {pickups.map((p) => (
              <AdminOrderRow
                key={p._id}
                pickup={p}
                onChange={handleChange}
                partners={partners}
                drivers={drivers}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
