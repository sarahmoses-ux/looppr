import { lazy, Suspense, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { fetchMyPickups, fetchMyStats } from '../services/pickupApi'
import { PickupCard } from './Orders'

// Mapbox GL is a large dependency — only fetch it when the dashboard is
// actually visited, not as part of the main app bundle.
const PickupMap = lazy(() => import('../components/PickupMap'))

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

function StatsStrip({ user, stats }) {
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '—'

  const items = [
    { label: 'Orders', value: stats === null ? null : stats.totalOrders },
    { label: 'Total spent', value: stats === null ? null : formatMoney(stats.totalSpent) },
    { label: 'Member since', value: memberSince },
  ]

  return (
    <div className="mt-8 grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{item.label}</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-ink sm:text-2xl">
            {item.value === null ? (
              <span className="inline-block h-6 w-12 animate-pulse rounded bg-linen-soft align-middle" />
            ) : (
              item.value
            )}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]
  const [pickups, setPickups] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchMyPickups()
      .then(({ pickups: list }) => {
        if (!cancelled) setPickups(list)
      })
      .catch(() => {
        if (!cancelled) setPickups([])
      })
    fetchMyStats()
      .then(({ stats: fetched }) => {
        if (!cancelled) setStats(fetched)
      })
      .catch(() => {
        if (!cancelled) setStats({ totalOrders: 0, totalSpent: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const recent = pickups?.slice(0, 3) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Dashboard" description="Your Looppr dashboard — pickup locations and recent orders." noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Hey, {firstName}.
      </h1>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-periwinkle-soft px-5 py-4">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-periwinkle-text"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7M2 7h20v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7ZM12 22V7M12 7c-1.5 0-4-1-4-3.2S9.5 2 10.5 2 12 3.5 12 7ZM12 7c1.5 0 4-1 4-3.2S13.5 2 12.5 2 12 3.5 12 7Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-medium text-periwinkle-text">
          Free delivery on your first two orders — no code needed.
        </p>
      </div>

      <StatsStrip user={user} stats={stats} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div
          className="rounded-3xl p-8 text-white"
          style={{
            backgroundImage: 'linear-gradient(155deg, #7C73E6 0%, #5A52C5 100%)',
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
          <Button to="/profile" variant="ghost" className="mt-6 w-full">
            Edit profile
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-10">
        <h2 className="font-display text-xl font-semibold text-ink">Pickup locations</h2>
        <p className="mt-1 text-sm text-ink/55">
          {pickups?.some((p) => p.location)
            ? 'Your scheduled pickups across the Oklahoma service area.'
            : 'Looppr currently serves the OKC metro — Edmond, Norman & Moore.'}
        </p>
        <div className="mt-6">
          {pickups === null ? (
            <div className="h-[320px] animate-pulse rounded-3xl bg-linen-soft" />
          ) : (
            <Suspense fallback={<div className="h-[320px] animate-pulse rounded-3xl bg-linen-soft" />}>
              <PickupMap pickups={pickups} />
            </Suspense>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Recent activity</h2>
          {pickups && pickups.length > 0 && (
            <Button to="/orders" variant="ghost" className="px-4! py-2! text-sm!">
              View all
            </Button>
          )}
        </div>

        {pickups === null ? (
          <div className="mt-6 space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-ink/55">
              No pickups requested yet — book your first one to see it here.
            </p>
            <Button to="/book" variant="primary" className="mt-1">
              Schedule a pickup
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {recent.map((p) => (
              <PickupCard key={p._id} pickup={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
