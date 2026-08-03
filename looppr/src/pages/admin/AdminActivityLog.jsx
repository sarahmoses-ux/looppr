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

function ActivityRow({ entry }) {
  const contact = entry.entity?.clientId || entry.entity?.guest
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
        <p className="text-sm font-medium text-ink">{humanizeAction(entry.action)}</p>
        {contact?.name && (
          <p className="truncate text-xs text-ink/55">
            {contact.name}
            {entry.entity?.address?.city ? ` · ${entry.entity.address.city}` : ''}
          </p>
        )}
      </div>
      <span className="shrink-0 text-xs text-ink/45">{when}</span>
    </div>
  )
}

export default function AdminActivityLog() {
  const [activity, setActivity] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchActivityLog()
      .then(({ activity: list }) => {
        if (!cancelled) setActivity(list)
      })
      .catch(() => {
        if (!cancelled) setActivity([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <SEO title="Activity Log" description="Every automated and manual action across Looppr, in order." noindex />
      <p className="text-sm text-ink/55">The most recent 100 actions, newest first.</p>

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
