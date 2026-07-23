import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd } from '../seo/structuredData'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/pricing')
const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Pricing', path: '/pricing' }])

const PLANS = [
  {
    name: 'Pay-per-use',
    price: '$0',
    unit: '/mo',
    detail: 'No subscription. Order when you need it.',
    features: [
      '$1.59 per lb, wash & fold',
      '$4.99 delivery per order',
      'Real-time order tracking',
      'Saved wash preferences',
      '100% of tips to your driver',
    ],
    cta: 'Get started free',
    to: '/guest/book',
    highlight: false,
  },
  {
    name: 'Looppr+',
    price: '$80.99',
    unit: '/mo',
    detail: 'For regular customers with up to 100 lb monthly.',
    features: [
      'Up to 100 lb of wash & fold monthly',
      'Free delivery on every order',
      'Priority driver matching',
      '10% off express upgrades',
      'Favorite laundromat always first',
      'Order streak rewards',
    ],
    cta: 'Try free for 30 days',
    to: '/signup',
    highlight: true,
  },
  {
    name: 'LoopprBiz',
    price: '$500',
    unit: '/mo',
    detail: 'Monthly business laundry service.',
    features: [
      'Built for recurring business volume',
      'Free delivery, all orders',
      'Monthly invoice billing',
      'Dedicated account manager',
      '8-hour SLA guarantee',
      'Up to 5 team members',
    ],
    cta: 'Contact sales',
    to: '/business',
    highlight: false,
  },
]

const COMPARISON_ROWS = [
  { label: 'Included laundry', values: ['Pay by lb', 'Up to 100 lb/mo', 'Business volume'] },
  { label: 'Delivery fee', values: ['$4.99', 'Free', 'Free'], freeFrom: 1 },
  { label: 'Real-time tracking', values: ['✓', '✓', '✓'] },
  { label: 'Priority driver matching', values: ['—', '✓', '✓'] },
  { label: 'Invoice billing', values: ['—', '—', '✓'] },
  { label: 'Turnaround SLA', values: ['~24 hr', '~24 hr', '8 hr'] },
]

const ADDONS = [
  {
    name: 'Express 4-hour',
    price: '+$9',
    body: 'Jump the queue. Back in your hands within four hours.',
  },
  {
    name: 'Stain pre-treatment',
    price: '+$4',
    body: "Flag tricky items and we'll treat them with extra care.",
  },
  {
    name: 'Hang-dry items',
    price: '+$3',
    body: 'Delicates air-dried and laid flat, never tumbled.',
  },
  {
    name: 'Hypoallergenic wash',
    price: 'Free',
    body: 'Fragrance-free, dye-free detergent on request — no charge.',
  },
]

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Pricing() {
  return (
    <div>
      <SEO
        title={PAGE_META.title}
        description={PAGE_META.description}
        keywords={PAGE_META.keywords}
        jsonLd={BREADCRUMB_JSON_LD}
      />

      <section className="relative overflow-hidden px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 50% 60% at 50% 16%, #D7D3F7 0%, transparent 60%)',
            opacity: 0.7,
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
            Pricing
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl">
            Pay by the pound.
            <br />
            No surprises, ever.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-text">
            $1.59 per pound for wash &amp; fold. Subscribe and delivery is free. Your first pickup
            is always on us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 ${
                plan.highlight
                  ? 'border-transparent bg-gradient-to-br from-periwinkle to-periwinkle-text text-white shadow-[0_26px_60px_-20px_rgba(124,115,230,0.45)]'
                  : 'border-line bg-white'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#EF9F27] px-3.5 py-1 text-xs font-bold text-[#412402]">
                  MOST POPULAR
                </span>
              )}
              <p
                className={`text-sm font-semibold ${plan.highlight ? 'text-white/85' : 'text-periwinkle-text'}`}
              >
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
                    <CheckIcon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-success'}`}
                    />
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
      </section>

      <section className="border-t border-line bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Compare the plans
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-linen-soft">
                  <th className="px-5 py-3.5 text-xs font-semibold text-ink/45">Feature</th>
                  <th className="px-3 py-3.5 text-center text-sm font-semibold text-ink">Per-use</th>
                  <th className="bg-periwinkle-soft px-3 py-3.5 text-center text-sm font-semibold text-periwinkle-text">
                    Looppr+
                  </th>
                  <th className="px-3 py-3.5 text-center text-sm font-semibold text-ink">LoopprBiz</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3.5 text-ink/70">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={`px-3 py-3.5 text-center ${i === 1 ? 'bg-periwinkle-soft/60' : ''} ${
                          row.freeFrom !== undefined && i >= row.freeFrom
                            ? 'font-semibold text-success'
                            : v === '✓'
                              ? 'text-success'
                              : v === '—'
                                ? 'text-ink/25'
                                : 'text-ink'
                        }`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              Optional add-ons
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Tack on exactly what you need
            </h2>
          </div>
          <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {ADDONS.map((a) => (
              <div key={a.name} className="rounded-2xl border border-line bg-white p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">{a.name}</h3>
                  <span
                    className={`shrink-0 font-display text-lg font-semibold ${a.price === 'Free' ? 'text-success' : 'text-periwinkle'}`}
                  >
                    {a.price}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-footer px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Try it free. Decide later.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-muted">
            Your first pickup is on us — no card, no subscription. See if you ever want laundry
            day back.
          </p>
          <Button to="/guest/book" variant="primary" className="mt-8 px-9! py-4!">
            Schedule your free pickup
          </Button>
        </div>
      </section>
    </div>
  )
}
