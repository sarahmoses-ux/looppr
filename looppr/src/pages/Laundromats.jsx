import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/laundromats')

const EARNINGS = [
  { label: '300 lbs × $1.59', value: '$477/wk' },
  { label: 'Platform fee (20%)', value: '− $95' },
  { label: 'Supplies estimate', value: '− $40' },
]

const STEPS = [
  { n: '1', title: 'Apply in 5 minutes', body: 'Tell us your location, capacity and hours. No upfront cost, ever.' },
  { n: '2', title: 'Quick onboarding', body: 'We set your capacity limit and walk through the partner app. Takes an afternoon.' },
  { n: '3', title: 'Orders start flowing', body: 'Mostly Mon–Thu mornings — right when your machines sit idle.' },
  { n: '4', title: 'Paid every Friday', body: 'Weekly direct deposit. No invoicing, no chasing customers.' },
]

const BENEFITS = [
  'Zero upfront cost to join',
  'Orders arrive during your slowest hours',
  'You set your own capacity limit',
  'Weekly direct deposit, every Friday',
  'We bring the customers and the drivers',
]

export default function Laundromats() {
  return (
    <div>
      <SEO title={PAGE_META.title} description={PAGE_META.description} />

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 60% 60% at 26% 36%, #CFEFE3 0%, transparent 64%)',
            opacity: 0.8,
          }}
        />
        <div className="relative mx-auto grid max-w-[1140px] gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              For laundromats
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl">
              Turn idle machines into <span className="text-periwinkle">steady income.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-periwinkle-text">
              We send wash-and-fold orders from local customers during your slow hours. You do
              what you already do — we handle the customers, the drivers and the payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                to="/partners/signup"
                variant="accent"
                className="bg-periwinkle! hover:bg-periwinkle-text!"
              >
                Become a Partner
              </Button>
              <Button to="/partners/login" variant="ghost">
                Partner Login
              </Button>
            </div>
            <p className="mt-4 text-sm text-ink/55">
              Prefer to talk first?{' '}
              <a href="/laundromats/apply" className="font-semibold text-periwinkle-text hover:underline">
                Apply and we'll reach out
              </a>
            </p>
          </div>

          <div id="earnings" className="rounded-3xl bg-periwinkle p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-white/55">
              Example earnings · 20 orders / week
            </p>
            <div className="mt-4">
              {EARNINGS.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between border-b border-white/15 py-3 text-sm"
                >
                  <span className="text-white/70">{row.label}</span>
                  <span className="font-medium text-white">{row.value}</span>
                </div>
              ))}
              <div className="flex items-baseline justify-between pt-4">
                <span className="text-sm font-semibold text-white">Your weekly payout</span>
                <span className="font-display text-2xl font-semibold text-periwinkle-soft">
                  ~$342
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              How partnering works
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Live within 10 days of applying
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-linen-soft p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-periwinkle font-display text-sm font-semibold text-white">
                  {step.n}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen-soft px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1140px] gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl">
              No risk. No new equipment. No new staff.
            </h2>
            <div className="mt-6 flex flex-col gap-3.5">
              {BENEFITS.map((b) => (
                <p key={b} className="flex items-start gap-3 text-base text-periwinkle-text">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-periwinkle" fill="none" aria-hidden="true">
                    <path
                      d="M4 10.5l3.5 3.5L16 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {b}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-8">
            <p className="text-lg italic leading-relaxed text-ink">
              "We were running at half capacity on Tuesday mornings. Looppr fills that gap
              completely — and the orders just show up. I don't do anything differently."
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-periwinkle-soft text-sm font-semibold text-periwinkle-text">
                RM
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Rosa M.</p>
                <p className="text-xs text-ink/50">Owner, Suds &amp; Fold · Tulsa, OK</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-periwinkle px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fill your slow hours.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-soft">
            Apply today and you could be taking your first Looppr orders within ten days. No
            cost, no commitment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/partners/signup" variant="inverse" className="px-9! py-4!">
              Become a Partner
            </Button>
            <Button to="/partners/login" variant="ghost-light" className="px-9! py-4!">
              Partner Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
