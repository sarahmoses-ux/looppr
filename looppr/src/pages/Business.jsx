import { Link } from 'react-router-dom'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { BUSINESS_PLANS } from '../data/pricingPlans'
import { BUSINESS_STEPS } from '../data/businessSteps'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd, serviceJsonLd } from '../seo/structuredData'

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'For business', path: '/business' }])
const SERVICE_JSON_LD = serviceJsonLd({
  serviceType: 'Hotel laundry services',
  description: 'Commercial laundry pickup, wash & fold, and linen turnaround for hotels, gyms, Airbnb hosts and med spas.',
})

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/business')

const SEGMENTS = [
  {
    slug: 'airbnb-hosts',
    title: 'Airbnb superhosts',
    range: '8–20 lbs/day',
    body: 'Turn over linens between every guest, on time, without touching a washer.',
  },
  {
    slug: 'boutique-hotels',
    title: 'Boutique hotels',
    range: '50–200 lbs/day',
    body: 'Linens, towels and staff uniforms — daily or on surge, handled reliably.',
  },
  {
    slug: 'gyms-studios',
    title: 'Gyms & studios',
    range: '30–80 lbs/day',
    body: 'Towels, mats and apparel on a predictable schedule your members rely on.',
  },
  {
    slug: 'med-spas-salons',
    title: 'Med spas & salons',
    range: '10–30 lbs/day',
    body: 'Robes and treatment linens returned with premium, gentle care.',
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

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-white/50">
              Business pricing
            </p>
            {BUSINESS_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 ${
                  plan.highlight
                    ? 'border-transparent bg-gradient-to-br from-periwinkle to-periwinkle-text shadow-[0_26px_60px_-20px_rgba(124,115,230,0.45)]'
                    : 'border-white/15 bg-white/[0.06] backdrop-blur'
                }`}
              >
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-semibold text-white">{plan.price}</span>
                  <span className="text-sm text-white/60">{plan.unit}</span>
                </p>
                <p className="mt-1 text-xs text-white/70">{plan.detail}</p>
                <ul className="mt-4 space-y-1.5">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/80">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5DCAA5]" fill="none" aria-hidden="true">
                        <path
                          d="M4 10.5l3.5 3.5L16 6"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button to={plan.to} variant={plan.highlight ? 'inverse' : 'ghost-light'} className="mt-5 w-full">
                  {plan.cta}
                </Button>
              </div>
            ))}
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
              <Link
                key={s.title}
                to={`/business/${s.slug}`}
                className="group rounded-2xl border border-line bg-linen-soft p-6 transition-colors hover:border-periwinkle-muted hover:bg-white"
              >
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
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-periwinkle-text">
                  See details
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden="true">
                    <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
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
            {BUSINESS_STEPS.map((step) => (
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

      <section id="business-pricing" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              Business pricing
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Plans built for commercial volume
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:max-w-xl sm:mx-auto md:mx-0 md:max-w-none md:grid-cols-2">
            {BUSINESS_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 ${
                  plan.highlight
                    ? 'border-transparent bg-gradient-to-br from-periwinkle to-periwinkle-text text-white shadow-[0_26px_60px_-20px_rgba(124,115,230,0.45)]'
                    : 'border-line bg-linen-soft'
                }`}
              >
                <p className={`text-sm font-semibold ${plan.highlight ? 'text-white/85' : 'text-periwinkle-text'}`}>
                  {plan.name}
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold">{plan.price}</span>
                  <span className={plan.highlight ? 'text-white/70' : 'text-ink/50'}>{plan.unit}</span>
                </p>
                <p className={`mt-1 text-xs ${plan.highlight ? 'text-white/75' : 'text-ink/50'}`}>
                  {plan.detail}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg
                        viewBox="0 0 20 20"
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-success'}`}
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 10.5l3.5 3.5L16 6"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className={plan.highlight ? 'text-white/90' : 'text-ink/70'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button to={plan.to} variant={plan.highlight ? 'inverse' : 'ghost'} className="mt-8 w-full">
                  {plan.cta}
                </Button>
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
          <p className="mt-5 text-sm text-white/80">Derek L. · Airbnb superhost, Looppr Business Starter plan</p>
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
