import { Link } from 'react-router-dom'
import Button from '../components/Button'
import HeroCarousel from '../components/HeroCarousel'
import SEO from '../components/SEO'
import { heroImages } from '../data/heroImages'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { LOCAL_BUSINESS_JSON_LD, serviceJsonLd } from '../seo/structuredData'

const HOME_PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/')

// Organization/WebSite JSON-LD render sitewide (see PublicLayout.jsx) —
// Landing adds the schema specific to it: the service offering itself, plus
// LocalBusiness (most relevant on the homepage and Cities, where "laundry
// near me" search intent is highest).
const SERVICE_JSON_LD = serviceJsonLd({
  serviceType: 'Laundry pickup and delivery',
  price: '1.59',
  description: 'Wash & fold laundry service, priced per pound',
})

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
    ],
    cta: 'Get started free',
    to: '/guest/book',
    highlight: false,
  },
  {
    name: 'Looppr+',
    price: '$14.99',
    unit: '/mo',
    detail: 'Pays for itself at 3 orders a month.',
    features: [
      '$1.59 per lb, wash & fold',
      'Free delivery on every order',
      'Priority driver matching',
      'Favorite laundromat always first',
    ],
    cta: 'Try free for 30 days',
    to: '/signup',
    highlight: true,
  },
  {
    name: 'LoopprBiz',
    price: '$49.99',
    unit: '/mo',
    detail: 'For hotels, gyms & Airbnb hosts.',
    features: [
      '$1.29 per lb (volume rate)',
      'Free delivery, all orders',
      'Monthly invoice billing',
      'Dedicated account manager',
    ],
    cta: 'Contact sales',
    to: '/business',
    highlight: false,
  },
]

// In-content links to the site's other major pages — the global Navbar
// links to these too, but a repeated boilerplate nav link carries far less
// topical-relevance signal than a contextual, descriptively-labeled link
// from the homepage's own content. Keeps the homepage passing authority to
// every major section of the site, not just the ones already linked above.
const EXPLORE_LINKS = [
  { to: '/about', title: 'About Looppr', body: 'How a Tulsa laundromat and a borrowed van became a laundry marketplace.' },
  { to: '/laundromats', title: 'Partner your laundromat', body: 'Join the Looppr laundry marketplace and fill your slow hours with new orders.' },
  { to: '/drive', title: 'Drive with Looppr', body: 'Earn on your schedule delivering laundry pickup & delivery orders near you.' },
  { to: '/cities', title: 'Cities & coverage', body: 'See where Looppr laundry service is available, and join the waitlist for your city.' },
  { to: '/faq', title: 'Help & FAQ', body: 'What is Looppr, how does pickup work, and other common questions, answered.' },
]

const VALUE_PROPS = [
  {
    title: 'Real laundry pros, not a warehouse',
    body: 'Every order goes to an independent local laundry business we’ve vetted — not a faceless facility.',
  },
  {
    title: 'Know exactly where your order stands',
    body: 'From pickup to delivery, track status in one place and get emailed the second something changes.',
  },
  {
    title: 'Pay securely, once',
    body: 'Card on file, charged when your order is confirmed. No cash, no surprise fees.',
  },
]

export default function Landing() {
  return (
    <>
      <SEO
        description={HOME_PAGE_META.description}
        keywords={HOME_PAGE_META.keywords}
        jsonLd={[SERVICE_JSON_LD, LOCAL_BUSINESS_JSON_LD]}
      />

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 60% at 74% 30%, #D7D3F7 0%, transparent 64%), linear-gradient(#F0EFFF 0%, #F8F7FF 60%)',
          }}
        />

        <div className="relative mx-auto grid max-w-[1600px] gap-12 px-4 sm:px-6 lg:px-8 pb-20 pt-16 md:grid-cols-2 md:items-center md:pb-28 md:pt-24">
          <div>
            <span className="animate-float-badge inline-flex items-center gap-2.5 rounded-full bg-periwinkle py-2 pl-2.5 pr-4 text-base font-bold text-white shadow-[0_10px_30px_-6px_rgba(124,115,230,0.6)] sm:text-lg">
              <span className="rounded-full bg-white px-2.5 py-1 text-sm font-extrabold tracking-wide text-periwinkle sm:text-base">
                FREE
              </span>
              Delivery on your first two orders
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Laundry,
              <br />
              <em className="font-display italic text-periwinkle">handled.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-periwinkle-text">
              Book a pickup in minutes. A trusted local laundry pro washes and
              folds your clothes, then we bring them back — and email you the
              moment they’re ready.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button to="/signup" variant="primary" className="px-8! py-3.5! text-base!">
                Schedule your first pickup
              </Button>
              <Button to="/guest/book" variant="ghost" className="px-8! py-3.5! text-base!">
                Book without an account
              </Button>
            </div>
            <a
              href="#pricing"
              className="mt-3 inline-block text-sm font-medium text-ink/50 underline decoration-ink/15 underline-offset-4 transition-colors hover:text-ink"
            >
              See pricing
            </a>
            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <span className="block font-display text-2xl font-semibold text-ink">~24 hr</span>
                <span className="text-xs text-ink/50">Average turnaround</span>
              </div>
              <div className="w-px bg-line" />
              <div>
                <span className="block font-display text-2xl font-semibold text-ink">4 cities</span>
                <span className="text-xs text-ink/50">At launch, August 2026</span>
              </div>
            </div>
          </div>
          <HeroCarousel images={heroImages} />
        </div>
      </section>

      <section id="pricing" className="border-t border-line bg-linen-soft">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              Pricing
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Pay by the pound. No surprises.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/65">
              $1.59 per pound for wash &amp; fold. Free delivery on your first two orders — no
              subscription required to start.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 ${
                  plan.highlight
                    ? 'border-transparent bg-gradient-to-br from-periwinkle to-periwinkle-text text-white shadow-[0_26px_60px_-20px_rgba(124,115,230,0.45)]'
                    : 'border-line bg-white shadow-[0_20px_45px_-30px_rgba(30,27,75,0.25)]'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
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
                  <span className={plan.highlight ? 'text-white/70' : 'text-ink/50'}>
                    {plan.unit}
                  </span>
                </p>
                <p className={`mt-1 text-xs ${plan.highlight ? 'text-white/75' : 'text-ink/50'}`}>
                  {plan.detail}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg
                        viewBox="0 0 20 20"
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlight ? 'text-white' : 'text-success'
                        }`}
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

          <p className="mt-8 text-center text-sm text-ink/50">
            Want the full breakdown?{' '}
            <Link to="/pricing" className="font-semibold text-periwinkle-text hover:underline">
              See all plans &amp; a feature comparison →
            </Link>
          </p>
        </div>
      </section>

      <section id="why-loopr" className="border-t border-line bg-linen-soft">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              Built to feel like a great local service, not a shipping label.
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {VALUE_PROPS.map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="explore-looppr-heading" className="border-t border-line bg-white">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-20">
          <h2 id="explore-looppr-heading" className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Explore Looppr
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORE_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-line bg-linen-soft p-6 transition-colors hover:border-periwinkle"
              >
                <h3 className="font-display text-base font-semibold text-ink group-hover:text-periwinkle-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
