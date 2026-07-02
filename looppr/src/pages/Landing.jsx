import Button from '../components/Button'
import HeroCarousel from '../components/HeroCarousel'
import { heroImages } from '../data/heroImages'
import logoTransparent from '../assets/looppr-mark-transparent.png'

const STEPS = [
  {
    n: '01',
    title: 'Schedule a pickup',
    body: 'Pick a window that works for you. We factor in your laundry pro’s real availability, so there’s no guessing.',
  },
  {
    n: '02',
    title: 'We wash, fold, and care',
    body: 'A vetted local laundry pro handles your order by hand — sorted, washed, and folded the way you’d do it yourself.',
  },
  {
    n: '03',
    title: 'Get notified the moment it’s ready',
    body: 'We email you as soon as your order is ready and again when it’s on its way back to your door.',
  },
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
    cta: 'Subscribe to Looppr+',
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
    highlight: false,
  },
]

export default function Landing() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 60% at 74% 30%, #D7D3F7 0%, transparent 64%), linear-gradient(#F0EFFF 0%, #F8F7FF 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#1E1B4B 1px, transparent 1px), linear-gradient(90deg, #1E1B4B 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pb-28 md:pt-24">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-periwinkle">
              Wash. Fold. Delivered.
            </p>
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
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
              >
                See how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <span className="block font-display text-2xl font-semibold text-ink">Free</span>
                <span className="text-xs text-ink/50">Delivery on your first two orders</span>
              </div>
              <div className="w-px bg-line" />
              <div>
                <span className="block font-display text-2xl font-semibold text-ink">~24 hr</span>
                <span className="text-xs text-ink/50">Average turnaround</span>
              </div>
              <div className="w-px bg-line" />
              <div>
                <span className="block font-display text-2xl font-semibold text-ink">4 cities</span>
                <span className="text-xs text-ink/50">At launch, July 2026</span>
              </div>
            </div>
          </div>
          <HeroCarousel images={heroImages} />
        </div>
      </section>

      <section id="how-it-works" className="border-t border-line bg-linen-soft">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            How Looppr works
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="font-display text-sm font-semibold text-periwinkle">
                  {step.n}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Pay by the pound. No surprises.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/65">
            $1.59 per pound for wash &amp; fold. Free delivery on your first
            two orders — no subscription required to start.
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
              <Button
                to="/signup"
                variant={plan.highlight ? 'inverse' : 'ghost'}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="why-loopr" className="border-t border-line bg-linen-soft">
        <div className="mx-auto max-w-6xl px-6 py-20">
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

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(155deg, #1E1B4B 0%, #332AB8 55%, #1E1B4B 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(124,115,230,0.4), transparent 40%), radial-gradient(circle at 85% 80%, rgba(124,115,230,0.25), transparent 38%)',
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
          <img src={logoTransparent} alt="" className="h-12 w-12" />
          <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your first pickup is a couple minutes away.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/65">
            Create an account, tell us what you need washed, and pick a
            pickup window — delivery's free on your first two orders.
          </p>
          <Button to="/signup" variant="inverse" className="mt-2 px-8! py-3.5! text-base!">
            Get started
          </Button>
        </div>
      </section>
    </>
  )
}
