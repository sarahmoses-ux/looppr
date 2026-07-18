import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/drive')

const STATS = [
  { value: '$18/hr', label: 'Guaranteed first 2 weeks' },
  { value: '100%', label: 'Of tips go to you' },
  { value: 'Friday', label: 'Weekly direct deposit' },
]

const STEPS = [
  { n: '1', title: 'Go online when free', body: 'Open the driver app and accept routes that fit your day. No set shifts.' },
  { n: '2', title: 'Grab the bag', body: "Collect a labeled bag from the customer's door — no waiting, no contact needed." },
  { n: '3', title: 'Drop at the laundromat', body: "Usually just a few blocks away. Scan it in and you're done with that leg." },
  { n: '4', title: 'Deliver it back clean', body: 'Return the finished order the next morning and collect your tip.' },
]

const WHY_STAY = [
  'Short, local routes — far less driving than food delivery',
  'Predictable morning and evening windows',
  'No hot food, no spills, no melting ice cream',
  'Keep 100% of every tip',
  'Weekly direct deposit, no waiting',
]

const REQUIREMENTS = [
  "A car, and a valid driver's license & insurance",
  '18 or older, smartphone with the driver app',
  'A clean background check (we run it free)',
  "A few hours a week — that's genuinely it",
]

export default function Drive() {
  return (
    <div>
      <SEO title={PAGE_META.title} description={PAGE_META.description} />

      <section className="relative overflow-hidden px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 60% 60% at 72% 30%, #FBE6C2 0%, transparent 64%)',
            opacity: 0.7,
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#C77A12]">
            Drive with Looppr
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Earn up to <span className="text-[#C77A12]">$25/hr</span>
            <br />
            on your own schedule.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-periwinkle-text">
            Pick up laundry, drop it at a partner laundromat, deliver it back clean. Short
            routes, flexible hours, and a guaranteed $18/hr minimum your first two weeks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/drive/signup" variant="primary" className="px-8! py-4!">
              Become a Driver
            </Button>
            <Button to="/drive/login" variant="ghost" className="px-8! py-4!">
              Driver Login
            </Button>
          </div>
          <p className="mt-4 text-sm text-periwinkle-text">
            Prefer to talk first?{' '}
            <a href="/drive/apply" className="font-semibold text-ink underline-offset-2 hover:underline">
              Apply to drive
            </a>
          </p>
        </div>
        <div className="relative mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="min-w-[150px] rounded-2xl border border-line bg-white px-7 py-5">
              <p className="font-display text-3xl font-semibold text-ink">{s.value}</p>
              <p className="mt-1.5 text-sm text-ink/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#C77A12]">
              A driver's day
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Simpler than food delivery
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-linen-soft p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EF9F27] font-display text-sm font-bold text-[#412402]">
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
        <div className="mx-auto grid max-w-[1140px] gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl">
              Why drivers stay
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              {WHY_STAY.map((b) => (
                <p key={b} className="flex items-start gap-3 text-base text-periwinkle-text">
                  <span className="mt-0.5 shrink-0 text-[#EF9F27]">✦</span>
                  {b}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-8">
            <h3 className="text-base font-semibold text-ink">What you'll need</h3>
            <div className="mt-4 flex flex-col gap-3.5">
              {REQUIREMENTS.map((r) => (
                <p key={r} className="flex items-start gap-3 text-sm text-periwinkle-text">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-success" fill="none" aria-hidden="true">
                    <path
                      d="M4 10.5l3.5 3.5L16 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {r}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-footer px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start earning this week.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-muted">
            Apply in minutes. Once your background check clears, you can take your first route
            right away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              to="/drive/signup"
              variant="accent"
              className="bg-[#EF9F27]! px-9! py-4! text-[#412402]! hover:bg-[#f0a838]!"
            >
              Become a Driver
            </Button>
            <Button to="/drive/login" variant="ghost-light" className="px-9! py-4!">
              Driver Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
