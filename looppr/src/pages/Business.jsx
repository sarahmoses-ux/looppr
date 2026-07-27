import { useEffect, useState } from 'react'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { BUSINESS_SEGMENTS } from '../data/businessSegments'
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
    icon: 'key',
    title: 'Airbnb superhosts',
    range: '8–20 lbs/day',
    body: 'Turn over linens between every guest, on time, without touching a washer.',
  },
  {
    slug: 'boutique-hotels',
    icon: 'hotel',
    title: 'Hotels',
    range: '50–200 lbs/day',
    body: 'Linens, towels and staff uniforms — daily or on surge, handled reliably.',
  },
  {
    slug: 'gyms-studios',
    icon: 'dumbbell',
    title: 'Gyms & studios',
    range: '30–80 lbs/day',
    body: 'Towels, mats and apparel on a predictable schedule your members rely on.',
  },
  {
    slug: 'med-spas-salons',
    icon: 'sparkles',
    title: 'Med spas & salons',
    range: '10–30 lbs/day',
    body: 'Robes and treatment linens returned with premium, gentle care.',
  },
]

const SEGMENT_DETAILS = Object.fromEntries(BUSINESS_SEGMENTS.map((segment) => [
  segment.slug === 'boutique-hotels' ? 'Hotels' : segment.name,
  segment,
]))

function SegmentIcon({ type }) {
  const paths = {
    key: <><circle cx="8" cy="15" r="3" /><path d="m10.2 12.8 8-8M15 5l2 2M12.5 7.5l2 2" /></>,
    hotel: <><path d="M3 20V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14M3 10h18v10M7 8h4M7 12h4M7 16h4" /><path d="M17 14h4v6" /></>,
    dumbbell: <><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10M2 10v4M22 10v4" /></>,
    sparkles: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3ZM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" /><path d="m5 14 .7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Z" /></>,
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type]}
    </svg>
  )
}

export default function Business() {
  const [activeSegment, setActiveSegment] = useState(null)

  useEffect(() => {
    if (!activeSegment) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setActiveSegment(null)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [activeSegment])

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
            {SEGMENTS.map((segment) => (
              <button
                key={segment.title}
                type="button"
                onClick={() => setActiveSegment({ ...segment, details: SEGMENT_DETAILS[segment.title] })}
                className="group rounded-2xl border border-line bg-linen-soft p-6 text-left transition-all hover:-translate-y-1 hover:border-periwinkle-muted hover:bg-white hover:shadow-[0_16px_36px_-20px_rgba(30,27,75,0.32)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-periwinkle-soft px-2.5 py-2 text-periwinkle-text">
                    <SegmentIcon type={segment.icon} />
                  </span>
                  <span className="rounded-md bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-dark">
                    {segment.range}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">{segment.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{segment.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-periwinkle-text">
                  Explore service details
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden="true">
                    <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeSegment && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveSegment(null)
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="segment-dialog-title"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
                  {activeSegment.details?.heroEyebrow ?? `For ${activeSegment.title}`}
                </p>
                <h2 id="segment-dialog-title" className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
                  {activeSegment.title} laundry services
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSegment(null)}
                className="rounded-full p-2 text-ink/50 transition-colors hover:bg-linen-soft hover:text-ink"
                aria-label="Close service details"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mt-5 text-base leading-relaxed text-ink/65">
              {activeSegment.details?.heroBody ?? activeSegment.body}
            </p>
            {activeSegment.details?.painPoints && (
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {activeSegment.details.painPoints.map((painPoint) => (
                  <div key={painPoint.title} className="rounded-2xl bg-linen-soft p-4">
                    <h3 className="text-sm font-semibold text-ink">{painPoint.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink/60">{painPoint.body}</p>
                  </div>
                ))}
              </div>
            )}
            {activeSegment.details?.handled && (
              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-periwinkle">What we handle</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {activeSegment.details.handled.map((service) => (
                    <div key={service.title} className="flex gap-2 rounded-xl border border-line p-3">
                      <span className="mt-0.5 text-success">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{service.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink/60">{service.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/business/signup" variant="primary">Create business account</Button>
              <Button to="/business/apply" variant="ghost">Talk to sales</Button>
            </div>
          </div>
        </div>
      )}

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
