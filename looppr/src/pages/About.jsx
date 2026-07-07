import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/about')

const VALUES = [
  {
    title: 'Real neighborhoods, real laundromats',
    body: 'Every order goes to an independent laundry business already serving your area — not a warehouse we built from scratch.',
  },
  {
    title: 'Honest pricing',
    body: '$1.59 per pound, no hidden fees. You see the price before you commit, every time.',
  },
  {
    title: 'Built for Oklahoma first',
    body: "We're launching in our own backyard — OKC, Edmond, Norman & Moore — before anywhere else.",
  },
]

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">About</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Laundry, <em className="italic text-periwinkle">handled.</em>
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/70">
        Looppr is a laundry pickup &amp; delivery service built by and for Oklahoma. We connect
        neighbors who'd rather not spend their weekend at the laundromat with the local wash-and-fold
        businesses already doing great work in their community.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink/60">
        Looppr Inc. is based in Edmond, Oklahoma, and launches July 23, 2026 across the OKC metro —
        Oklahoma City, Edmond, Norman, and Moore. Instead of building warehouses and hiring an army of
        washers, we partner with vetted local laundromats who already know how to get your clothes
        clean — we just handle the pickup, delivery, and everything in between.
      </p>

      <h2 className="mt-14 font-display text-2xl font-semibold text-ink">What we care about</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title}>
            <h3 className="font-display text-lg font-semibold text-ink">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl border border-line bg-linen-soft p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-ink">Want to be part of it?</h2>
        <p className="mt-2 text-sm text-ink/60">
          Join the waitlist, partner your laundromat with us, or apply to drive.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button to="/signup" variant="primary">
            Get started
          </Button>
          <Button to="/laundromats" variant="ghost">
            Partner with us
          </Button>
        </div>
      </div>
    </div>
  )
}
