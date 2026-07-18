import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd, serviceJsonLd } from '../seo/structuredData'

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'For business', path: '/business' }])
const SERVICE_JSON_LD = serviceJsonLd({
  serviceType: 'Hotel laundry services',
  description: 'Commercial laundry pickup, wash & fold, and linen turnaround for hotels, gyms, Airbnb hosts and med spas.',
})

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/business')

const WHAT_YOU_GET = [
  { title: '8-hour turnaround SLA', body: 'Guaranteed, in writing.' },
  { title: 'Same laundromat every time', body: 'A consistent partner who knows your account.' },
  { title: 'Dedicated account manager', body: 'For any account over 50 lbs/day.' },
  { title: 'First week free', body: 'No contract, no credit card to start.' },
]

const SEGMENTS = [
  {
    title: 'Airbnb superhosts',
    range: '8–20 lbs/day',
    body: 'Turn over linens between every guest, on time, without touching a washer.',
  },
  {
    title: 'Boutique hotels',
    range: '50–200 lbs/day',
    body: 'Linens, towels and staff uniforms — daily or on surge, handled reliably.',
  },
  {
    title: 'Gyms & studios',
    range: '30–80 lbs/day',
    body: 'Towels, mats and apparel on a predictable schedule your members rely on.',
  },
  {
    title: 'Med spas & salons',
    range: '10–30 lbs/day',
    body: 'Robes and treatment linens returned with premium, gentle care.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Onboarding call',
    body: 'We map your volume, schedule and linen types, then match a partner laundromat.',
  },
  {
    n: '2',
    title: 'Daily pickups begin',
    body: 'A driver collects at the same time each day. Track every bag in the dashboard.',
  },
  {
    n: '3',
    title: 'Back within 8 hours',
    body: 'Clean, folded and sorted to your spec — guaranteed by the SLA.',
  },
  {
    n: '4',
    title: 'One monthly invoice',
    body: "No per-order accounting. One clean statement at month's end.",
  },
]

export default function Business() {
  return (
    <div>
      <SEO
        title={PAGE_META.title}
        description={PAGE_META.description}
        keywords={PAGE_META.keywords}
        jsonLd={[BREADCRUMB_JSON_LD, SERVICE_JSON_LD]}
      />

      <section className="relative overflow-hidden bg-ink px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 55% 70% at 80% 46%, #2E2880 0%, transparent 62%)',
          }}
        />
        <div className="relative mx-auto grid max-w-[1140px] gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle-muted">
              For business
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl">
              Your laundry operation, fully handled.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-periwinkle-muted">
              Hotels, gyms, Airbnb superhosts and med spas use Looppr for linen turnaround without
              the staffing headache. We show up daily on your schedule and invoice you monthly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/business/signup" variant="inverse">
                Create business account
              </Button>
              <Button to="/business/login" variant="ghost-light">
                Business login
              </Button>
            </div>
            <p className="mt-4 text-sm text-periwinkle-muted">
              Prefer to talk first?{' '}
              <a href="/business/apply" className="font-semibold text-white underline-offset-2 hover:underline">
                Talk to our business team
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-white/50">
              What you get
            </p>
            <div className="mt-4 flex flex-col gap-4">
              {WHAT_YOU_GET.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-[#5DCAA5]" fill="none" aria-hidden="true">
                    <path
                      d="M4 10.5l3.5 3.5L16 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs text-periwinkle-muted">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="segments" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              Who we serve
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Built for businesses that run on clean linen
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
            {SEGMENTS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-line bg-linen-soft p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-periwinkle-soft px-2.5 py-2 text-periwinkle-text">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </span>
                  <span className="rounded-md bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-dark">
                    {s.range}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen-soft px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              How it works for teams
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Set it up once, then stop thinking about it
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-white p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-sm font-semibold text-white">
                  {step.n}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-success px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-lg tracking-[3px] text-white/85">★★★★★</div>
          <p className="mt-5 font-display text-xl font-medium leading-relaxed text-white sm:text-2xl">
            "I run three Airbnbs. Before Looppr I was doing linen runs myself between guests. Now
            I just leave bags out and they come back folded. It changed my whole operation."
          </p>
          <p className="mt-5 text-sm text-white/80">Derek L. · Airbnb superhost, LoopprBiz plan</p>
        </div>
      </section>

      <section className="bg-ink-footer px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Get your first week free.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-muted">
            Tell us your volume and schedule. We'll match a partner laundromat and have you
            running this week — no contract.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/business/signup" variant="primary" className="px-9! py-4!">
              Create business account
            </Button>
            <Button to="/business/login" variant="ghost-light" className="px-9! py-4!">
              Business login
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
