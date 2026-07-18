import { useEffect, useState } from 'react'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd, LOCAL_BUSINESS_JSON_LD } from '../seo/structuredData'
import { joinWaitlist } from '../services/waitlistApi'

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Cities & coverage', path: '/cities' }])

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/cities')

const OK_LAUNCH_ETA = 'August 1, 2026'
const EXPANSION_ETA = 'Feb 2027'

const STATES = [
  {
    key: 'ok',
    name: 'Oklahoma',
    sub: `4 cities · Launching ${OK_LAUNCH_ETA}`,
    cities: [
      { name: 'Oklahoma City', region: 'Oklahoma County', eta: OK_LAUNCH_ETA },
      { name: 'Edmond', region: 'Oklahoma County', eta: OK_LAUNCH_ETA },
      { name: 'Norman', region: 'Cleveland County', eta: OK_LAUNCH_ETA },
      { name: 'Moore', region: 'Cleveland County', eta: OK_LAUNCH_ETA },
      { name: 'Tulsa', region: 'Tulsa County', eta: EXPANSION_ETA },
      { name: 'Broken Arrow', region: 'Tulsa County', eta: EXPANSION_ETA },
      { name: 'Lawton', region: 'Comanche County', eta: EXPANSION_ETA },
      { name: 'Stillwater', region: 'Payne County', eta: EXPANSION_ETA },
    ],
  },
  {
    key: 'tx',
    name: 'Texas',
    sub: `Launching ${EXPANSION_ETA}`,
    cities: [
      { name: 'Dallas', region: 'Dallas County', eta: EXPANSION_ETA },
      { name: 'Fort Worth', region: 'Tarrant County', eta: EXPANSION_ETA },
      { name: 'Plano', region: 'Collin County', eta: EXPANSION_ETA },
      { name: 'Frisco', region: 'Collin County', eta: EXPANSION_ETA },
      { name: 'Houston', region: 'Harris County', eta: EXPANSION_ETA },
      { name: 'Austin', region: 'Travis County', eta: EXPANSION_ETA },
      { name: 'San Antonio', region: 'Bexar County', eta: EXPANSION_ETA },
      { name: 'Denton', region: 'Denton County', eta: EXPANSION_ETA },
      { name: 'McKinney', region: 'Collin County', eta: EXPANSION_ETA },
      { name: 'Amarillo', region: 'Potter County', eta: EXPANSION_ETA },
    ],
  },
  {
    key: 'ga',
    name: 'Georgia',
    sub: `Launching ${EXPANSION_ETA}`,
    cities: [
      { name: 'Atlanta', region: 'Fulton County', eta: EXPANSION_ETA },
      { name: 'Alpharetta', region: 'Fulton County', eta: EXPANSION_ETA },
      { name: 'Roswell', region: 'Fulton County', eta: EXPANSION_ETA },
      { name: 'Sandy Springs', region: 'Fulton County', eta: EXPANSION_ETA },
      { name: 'Marietta', region: 'Cobb County', eta: EXPANSION_ETA },
      { name: 'Savannah', region: 'Chatham County', eta: EXPANSION_ETA },
      { name: 'Augusta', region: 'Richmond County', eta: EXPANSION_ETA },
      { name: 'Columbus', region: 'Muscogee County', eta: EXPANSION_ETA },
      { name: 'Macon', region: 'Bibb County', eta: EXPANSION_ETA },
      { name: 'Warner Robins', region: 'Houston County', eta: EXPANSION_ETA },
    ],
  },
]

function CityCard({ city, isYou, onJoinClick }) {
  return (
    <div
      className={`relative rounded-2xl border-[1.5px] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(30,27,75,0.1)] ${
        isYou ? 'border-periwinkle' : 'border-line'
      }`}
    >
      {isYou && (
        <span className="absolute right-3.5 top-3.5 rounded-full bg-periwinkle px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
          YOU'RE HERE
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-line-soft" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink/45">
          Coming {city.eta}
        </span>
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold text-ink">{city.name}</h3>
      <p className="mb-3.5 text-sm text-ink/45">{city.region}</p>
      <button
        type="button"
        onClick={onJoinClick}
        className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-line px-4 py-2 text-sm font-semibold text-periwinkle-text transition-colors hover:border-periwinkle"
      >
        Join waitlist
      </button>
    </div>
  )
}

export default function Cities() {
  const [detecting, setDetecting] = useState(true)
  const [userCity, setUserCity] = useState(null)
  const [userState, setUserState] = useState(null)

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setUserCity(d.city || null)
          setUserState(d.region_code || null)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDetecting(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function isYourCity(name) {
    if (detecting || !userCity) return false
    const a = userCity.toLowerCase()
    const b = name.toLowerCase()
    return a.includes(b) || b.includes(a)
  }

  let locationLabel = 'Detecting your location…'
  let locationSub = 'Checking coverage near you'
  let dotClass = 'bg-periwinkle-muted'
  if (!detecting) {
    if (!userCity) {
      locationLabel = 'Location unavailable'
      locationSub = 'Browse cities below to check coverage'
      dotClass = 'bg-white/30'
    } else {
      locationLabel = `${userCity}${userState ? `, ${userState}` : ''} — coming soon`
      locationSub = 'Join the waitlist to be first when we launch'
      dotClass = 'bg-periwinkle'
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setStatus('pending')
    try {
      await joinWaitlist(email)
      setJoined(true)
      setEmail('')
      setTimeout(() => setIsModalOpen(false), 800)
    } catch (err) {
      setError(
        err.response?.status === 429
          ? 'Too many attempts. Please try again later.'
          : err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.',
      )
    } finally {
      setStatus('idle')
    }
  }

  function openWaitlistModal() {
    setJoined(false)
    setError('')
    setIsModalOpen(true)
  }

  function closeWaitlistModal() {
    setIsModalOpen(false)
    setError('')
  }

  return (
    <div>
      <SEO
        title={PAGE_META.title}
        description={PAGE_META.description}
        keywords={PAGE_META.keywords}
        jsonLd={[BREADCRUMB_JSON_LD, LOCAL_BUSINESS_JSON_LD]}
      />

      <section className="relative overflow-hidden bg-ink-footer px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 55% 65% at 50% 0%, #2E2880 0%, transparent 68%)',
          }}
        />
        <div className="relative mx-auto max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle-muted">
            Coverage map
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Looppr is coming
            <br />
            to your city.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-muted">
            We're launching across the OKC metro, expanding into Texas and Georgia in 2027. Join the waitlist and be first when we arrive.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{locationLabel}</p>
              <p className="text-xs text-periwinkle-muted">{locationSub}</p>
            </div>
          </div>
        </div>
      </section>

      {STATES.map((state, i) => (
        <section key={state.key} className={`px-4 sm:px-6 lg:px-8 ${i === 0 ? 'pt-16 sm:pt-20' : 'pt-0'} pb-16 sm:pb-20`}>
          <div className="mx-auto max-w-[1140px]">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {state.name}
              </h2>
              <p className="mt-1 text-sm text-ink/45">{state.sub}</p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {state.cities.map((city) => (
                <CityCard
                  key={city.name}
                  city={city}
                  isYou={isYourCity(city.name)}
                  onJoinClick={openWaitlistModal}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section id="notify" className="bg-ink-footer px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-md">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Don't see your city?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-periwinkle-muted">
            We're expanding fast. Drop your email and we'll let you know the moment Looppr
            arrives near you.
          </p>

          <div className="mt-7">
            <button
              type="button"
              onClick={openWaitlistModal}
              className="rounded-full bg-periwinkle px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-periwinkle/90"
            >
              Notify me
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-6">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 text-left shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
                  Waitlist
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                  Be the first to know
                </h3>
              </div>
              <button
                type="button"
                onClick={closeWaitlistModal}
                aria-label="Close waitlist form"
                className="rounded-full p-2 text-ink/50 transition-colors hover:bg-linen-soft hover:text-ink"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              We’ll email you as soon as Looppr reaches your city.
            </p>

            {joined ? (
              <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 px-4 py-4">
                <p className="text-sm font-semibold text-success-soft">
                  You're on the list — we'll reach out soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="w-full rounded-xl border border-line bg-linen-soft px-4 py-3.5 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-periwinkle"
                />
                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={closeWaitlistModal}
                    className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-linen-soft"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="accent" disabled={status === 'pending'}>
                    {status === 'pending' ? 'Joining…' : 'Notify me'}
                  </Button>
                </div>
              </form>
            )}
            {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
