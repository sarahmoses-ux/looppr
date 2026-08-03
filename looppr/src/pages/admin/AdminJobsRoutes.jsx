import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/SEO'
import { useToast } from '../../context/ToastContext'
import { ORDER_FLOW } from '../../constants/orderStatus'
import { fetchAllPickups, updateOrderStatus } from '../../services/adminApi'

const WINDOW_LABELS = {
  morning: '8am – 11am',
  afternoon: '12pm – 3pm',
  evening: '4pm – 7pm',
}

const COLUMN_DOTS = ['bg-periwinkle', 'bg-amber-500', 'bg-sky-500', 'bg-success']

function JobCard({ pickup, nextLabel, onAdvance, busy }) {
  const contact = pickup.clientId || pickup.guest
  const dateLabel = new Date(pickup.preferredDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  const tag = pickup.source === 'business' ? 'B2B' : pickup.source === 'guest' ? 'Guest' : 'Customer'

  return (
    <button
      type="button"
      onClick={onAdvance}
      disabled={!nextLabel || busy}
      className="w-full rounded-xl border border-line bg-white p-3 text-left transition-colors hover:border-periwinkle-muted disabled:cursor-default disabled:opacity-70"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-periwinkle-text">
          {dateLabel} · {WINDOW_LABELS[pickup.window]}
        </span>
        <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/55">
          {tag}
        </span>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-ink">{contact?.name || 'Unknown'}</p>
      <p className="mt-0.5 truncate text-xs text-ink/55">
        {pickup.address?.city}
        {pickup.partnerUserId ? ` · ${pickup.partnerUserId.businessName}` : ''}
        {pickup.driverUserId ? ` · ${pickup.driverUserId.name}` : ''}
      </p>
      {nextLabel && (
        <p className="mt-2 text-xs font-semibold text-periwinkle-text">
          {busy ? 'Moving…' : `Advance to ${nextLabel} →`}
        </p>
      )}
    </button>
  )
}

export default function AdminJobsRoutes() {
  const { showToast } = useToast()
  const [pickups, setPickups] = useState(null)
  const [movingId, setMovingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchAllPickups()
      .then(({ pickups: list }) => {
        if (!cancelled) setPickups(list)
      })
      .catch(() => {
        if (!cancelled) setPickups([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const columns = useMemo(() => {
    if (!pickups) return null
    return ORDER_FLOW.map((stage, i) => ({
      ...stage,
      next: ORDER_FLOW[i + 1]?.label ?? null,
      nextValue: ORDER_FLOW[i + 1]?.value ?? null,
      cards: pickups
        .filter((p) => p.status === stage.value)
        .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate)),
    }))
  }, [pickups])

  async function handleAdvance(pickup, nextValue) {
    if (!nextValue) return
    setMovingId(pickup._id)
    try {
      const { pickup: updated } = await updateOrderStatus(pickup._id, nextValue)
      setPickups((list) => list.map((p) => (p._id === updated._id ? updated : p)))
    } catch {
      showToast('Could not advance this job. Please try again.', 'error')
    } finally {
      setMovingId(null)
    }
  }

  return (
    <>
      <SEO title="Jobs & Routes" description="Advance Looppr laundry jobs through fulfillment." noindex />
      <p className="text-sm text-ink/55">
        Click a card to advance it to the next stage. Cancelled orders live in Orders.
      </p>

      {columns === null ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-linen-soft" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {columns.map((col, i) => (
            <div key={col.value} className="rounded-2xl bg-linen p-3">
              <div className="flex items-center gap-2 px-1 pb-2.5">
                <span className={`h-2 w-2 rounded-full ${COLUMN_DOTS[i]}`} />
                <p className="flex-1 text-xs font-bold uppercase tracking-wide text-periwinkle-text">
                  {col.label}
                </p>
                <span className="text-xs font-semibold text-ink/45">{col.cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {col.cards.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-ink/40">Nothing here.</p>
                ) : (
                  col.cards.map((p) => (
                    <JobCard
                      key={p._id}
                      pickup={p}
                      nextLabel={col.next}
                      busy={movingId === p._id}
                      onAdvance={() => handleAdvance(p, col.nextValue)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
