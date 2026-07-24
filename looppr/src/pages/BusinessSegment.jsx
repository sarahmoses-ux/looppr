import { Navigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { getBusinessSegment } from '../data/businessSegments'
import { BUSINESS_STEPS } from '../data/businessSteps'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd, serviceJsonLd } from '../seo/structuredData'

const CHECK_PATH = 'M4 10.5l3.5 3.5L16 6'

function Check({ className = 'h-4 w-4 text-success' }) {
  return (
    <svg viewBox="0 0 20 20" className={`mt-0.5 shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path d={CHECK_PATH} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BusinessSegment() {
  const { segment: slug } = useParams()
  const segment = getBusinessSegment(slug)

  if (!segment) {
    return <Navigate to="/business" replace />
  }

  const pageMeta = PUBLIC_PAGES.find((p) => p.path === `/business/${slug}`)
  const breadcrumbJson = breadcrumbJsonLd([
    { name: 'For business', path: '/business' },
    { name: segment.name, path: `/business/${slug}` },
  ])
  const serviceJson = serviceJsonLd({
    serviceType: `Laundry service for ${segment.name.toLowerCase()}`,
    description: segment.heroBody,
  })

  return (
    <div>
      <SEO
        title={pageMeta?.title ?? `Looppr for ${segment.name}`}
        description={pageMeta?.description ?? segment.heroBody}
        keywords={pageMeta?.keywords}
        jsonLd={[breadcrumbJson, serviceJson]}
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
              {segment.heroEyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl">
              {segment.heroTitle}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-periwinkle-muted">{segment.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/business/apply" variant="inverse">
                Talk to our business team
              </Button>
              <Button to="/business/signup" variant="ghost-light">
                Create business account
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-white/50">Typical volume</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">{segment.range}</p>
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-white/50">{segment.stat.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-white">{segment.stat.value}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">The problem</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Laundry shouldn't be the hard part of running {segment.name.toLowerCase()}
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-3">
            {segment.painPoints.map((p) => (
              <div key={p.title} className="rounded-2xl border border-line bg-linen-soft p-6">
                <h3 className="text-base font-semibold text-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen-soft px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">What we handle</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Everything that needs to come back clean
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
            {segment.handled.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-6">
                <Check className="h-5 w-5 text-success" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">How it works</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Set it up once, then stop thinking about it
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {BUSINESS_STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-linen-soft p-6">
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
            "{segment.testimonial.quote}"
          </p>
          <p className="mt-5 text-sm text-white/80">{segment.testimonial.author}</p>
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
            <Button to="/business" variant="ghost-light" className="px-9! py-4!">
              See all business plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
