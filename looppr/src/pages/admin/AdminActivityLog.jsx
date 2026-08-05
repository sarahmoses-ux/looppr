import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import { fetchActivityLog } from '../../services/adminApi'

const ACTOR_LABELS = {
  system: 'System',
  admin: 'Admin',
  rider: 'Driver',
  partner: 'Partner',
  client: 'Customer',
}

const ACTOR_STYLES = {
  system: 'bg-ink/5 text-ink/60',
  admin: 'bg-periwinkle-soft text-periwinkle-text',
  rider: 'bg-sky-50 text-sky-700',
  partner: 'bg-amber-50 text-amber-700',
  client: 'bg-success-soft text-success-dark',
}

// "order_accepted" -> "Order accepted"
function humanizeAction(action) {
  const words = action.split('_')
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ')
}

// Each entityType stores a differently-shaped document (see
// adminActivityController.js), so the "what/who this was about" line has to
// be built per type rather than read off one common field.
function entityLine(entry) {
  const entity = entry.entity
  if (!entity) return null
  if (entry.entityType === 'PickupRequest') {
    const contact = entity.clientId || entity.guest
    if (!contact?.name) return null
    return contact.name + (entity.address?.city ? ` · ${entity.address.city}` : '')
  }
  if (entry.entityType === 'DriverUser') {
    if (!entity.name) return null
    return entity.name + (entity.city ? ` · ${entity.city}` : '')
  }
  if (entry.entityType === 'PartnerUser') {
    if (!entity.businessName) return null
    return entity.businessName + (entity.city ? ` · ${entity.city}` : '')
  }
  return null
}

const ENTITY_TAG = {
  PickupRequest: 'Order',
  DriverUser: 'Driver',
  PartnerUser: 'Partner',
}

function ActivityRow({ entry }) {
  const line = entityLine(entry)
  const when = new Date(entry.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="flex items-start gap-3 py-3">
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ACTOR_STYLES[entry.actorType] || 'bg-ink/5 text-ink/60'}`}
      >
        {ACTOR_LABELS[entry.actorType] || entry.actorType}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">
          {humanizeAction(entry.action)}
          {ENTITY_TAG[entry.entityType] && (
            <span className="ml-2 rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/50">
              {ENTITY_TAG[entry.entityType]}
            </span>
          )}
        </p>
        {line && <p className="truncate text-xs text-ink/55">{line}</p>}
      </div>
      <span className="shrink-0 text-xs text-ink/45">{when}</span>
    </div>
  )
}

const ENTITY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PickupRequest', label: 'Orders' },
  { value: 'PartnerUser', label: 'Partners' },
  { value: 'DriverUser', label: 'Drivers' },
]

export default function AdminActivityLog() {
  const [activity, setActivity] = useState(null)
  const [entityType, setEntityType] = useState('')

  useEffect(() => {
    let cancelled = false
    // Deliberately not resetting to null here — keep the current list
    // visible (stale-while-revalidating) instead of flashing the skeleton
    // loader on every filter change, same pattern as AdminOrders.jsx.
    fetchActivityLog({ entityType: entityType || undefined })
      .then(({ activity: list }) => {
        if (!cancelled) setActivity(list)
      })
      .catch(() => {
        if (!cancelled) setActivity([])
      })
    return () => {
      cancelled = true
    }
  }, [entityType])

  return (
    <>
      <SEO title="Activity Log" description="Every automated and manual action across Looppr, in order." noindex />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/55">The most recent 100 actions, newest first.</p>
        <div className="flex rounded-full bg-linen p-1">
          {ENTITY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setEntityType(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                entityType === f.value ? 'bg-white text-ink shadow-sm' : 'text-ink/55'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {activity === null ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-12 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-12 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : activity.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">Nothing logged yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {activity.map((entry) => (
              <ActivityRow key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
