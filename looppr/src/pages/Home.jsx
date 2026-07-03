import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import { fetchMyPickups } from '../services/pickupApi'

function EmptyOrdersIllustration() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20 text-periwinkle-muted" fill="none" aria-hidden="true">
      <rect x="18" y="30" width="60" height="46" rx="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 44h60" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="37" r="3" fill="currentColor" />
      <path
        d="M34 30v-6a14 14 0 0 1 28 0v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const WINDOW_LABELS = {
  morning: 'Morning · 8am – 11am',
  afternoon: 'Afternoon · 12pm – 3pm',
  evening: 'Evening · 4pm – 7pm',
}

const STATUS_STYLES = {
  requested: 'bg-periwinkle-soft text-periwinkle-text',
  confirmed: 'bg-success-soft text-success-dark',
  cancelled: 'bg-red-50 text-red-600',
}

function PickupCard({ pickup }) {
  const dateLabel = new Date(pickup.preferredDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line px-5 py-4">
      <div>
        <p className="font-medium text-ink">
          {dateLabel} · {WINDOW_LABELS[pickup.window]}
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {pickup.address.street}, {pickup.address.city}, {pickup.address.state}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[pickup.status]}`}
      >
        {pickup.status}
      </span>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]
  const [pickups, setPickups] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchMyPickups()
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Hey, {firstName}.
      </h1>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-periwinkle-soft px-5 py-4">
        <span className="text-lg">🎉</span>
        <p className="text-sm font-medium text-periwinkle-text">
          Free delivery on your first two orders — no code needed.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div
          className="rounded-3xl p-8 text-white"
          style={{
            backgroundImage: 'linear-gradient(155deg, #1E1B4B 0%, #332AB8 100%)',
          }}
        >
          <h2 className="font-display text-2xl font-semibold">Ready for your next pickup?</h2>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            Schedule a pickup window and a local laundry pro will handle the
            rest — wash, fold, and back at your door.
          </p>
          <Button to="/book" variant="inverse" className="mt-6">
            Schedule a pickup
          </Button>
        </div>

        <div className="rounded-3xl border border-line bg-white p-8">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/45">
            Your details
          </h3>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs text-ink/45">Name</dt>
              <dd className="text-sm text-ink">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">Email</dt>
              <dd className="text-sm text-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/45">Phone</dt>
              <dd className="text-sm text-ink">{user?.phone}</dd>
            </div>
          </dl>
          <Button to="/settings" variant="ghost" className="mt-6 w-full">
            Edit profile
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white p-10">
        <h2 className="font-display text-xl font-semibold text-ink">Your pickup requests</h2>

        {pickups === null ? (
          <div className="mt-8 space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : pickups.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 py-6 text-center">
            <EmptyOrdersIllustration />
            <div>
              <p className="font-medium text-ink">No pickups requested yet</p>
              <p className="mt-1 text-sm text-ink/55">
                Book your first pickup and it'll show up here.
              </p>
            </div>
            <Button to="/book" variant="primary" className="mt-2">
              Schedule a pickup
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {pickups.map((p) => (
              <PickupCard key={p._id} pickup={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
