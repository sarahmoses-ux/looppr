import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd } from '../seo/structuredData'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/about')
const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'About', path: '/about' }])

const ORIGIN_STATS = [
  { value: '3', label: 'Test orders that started it all' },
  { value: '14', label: 'Laundromat partners in our first pilot city' },
  { value: '1,240', label: 'Orders completed in our first 90 days' },
  { value: '4.87★', label: 'Average platform rating since launch' },
]

const VALUES = [
  {
    title: 'Local partners, not warehouses',
    body: "Every order goes to a real laundromat in your neighborhood. We'll never build a central facility — the whole point is to make what's already there work better.",
  },
  {
    title: 'Drivers who earn a living wage',
    body: "We guarantee $18/hr minimum for new drivers and reward quality. We're not racing to the bottom — good pay makes reliable drivers and happy customers.",
  },
  {
    title: 'Honest turnaround times',
    body: "We only promise what we can deliver. If your order will be late, we tell you proactively — not after you've been waiting. Under-promise, over-deliver.",
  },
  {
    title: 'If it goes wrong, we fix it',
    body: 'No escalation queues, no "submit a ticket." Damaged, late or wrong — we respond the same day and make it right. Coverage up to $300 per order.',
  },
]

const TEAM = [
  {
    initials: 'JA',
    name: 'Jeffrey Azuatalam',
    role: 'Founder & CEO',
    bio: 'Founded Looppr after seeing the gap between half-empty laundromats and customers who couldn’t find reliable wash-and-fold. Building it city by city from Oklahoma.',
    bg: 'bg-periwinkle-soft',
    text: 'text-[#2E2880]',
  },
  {
    initials: 'MR',
    name: 'Maya Rivera',
    role: 'CTO & Co-founder',
    bio: 'Ex-delivery-platform engineering, where she built real-time dispatch used across 40 cities. Passionate about software that makes physical logistics invisible.',
    bg: 'bg-success-soft',
    text: 'text-success-dark',
  },
  {
    initials: 'JT',
    name: 'Jordan Tate',
    role: 'Head of partnerships',
    bio: 'Fifteen years in commercial laundry equipment sales. Knows every laundromat association in the region and has more industry relationships than anyone we’ve met.',
    bg: 'bg-[#FAEEDA]',
    text: 'text-[#633806]',
  },
  {
    initials: 'SP',
    name: 'Sam Park',
    role: 'Head of growth',
    bio: 'Previously ran referral and subscription growth from launch to two million users at a national grocery platform. Obsessed with the math behind retention.',
    bg: 'bg-[#FAECE7]',
    text: 'text-[#712B13]',
  },
]

const IMPACT_STATS = [
  { value: '$60K+', label: 'Paid to local partners in pilot city' },
  { value: '32', label: 'Local drivers earning on the platform' },
  { value: '14', label: 'Laundromat partners currently active' },
  { value: '67%', label: 'First-time customers who reorder' },
]

export default function About() {
  return (
    <div>
      <SEO
        title={PAGE_META.title}
        description={PAGE_META.description}
        keywords={PAGE_META.keywords}
        jsonLd={BREADCRUMB_JSON_LD}
      />

      <section className="relative overflow-hidden bg-ink px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 60% 70% at 82% 50%, #2E2880 0%, transparent 64%)',
          }}
        />
        <div className="relative mx-auto max-w-[1140px]">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle-muted">
            Our story
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
            We built Looppr because laundry was stealing our{' '}
            <span className="text-periwinkle-muted">Sundays.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-periwinkle-muted">
            There are 35,000 laundromats in the US sitting half-empty on weekday mornings, and
            millions of people losing hours every week to a chore they hate. We connect them —
            and get out of the way.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1140px] gap-14 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              How we started
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
              A laundromat, a spreadsheet, and a borrowed van.
            </h2>
            <div className="mt-6 space-y-4 text-[15.5px] leading-[1.8] text-periwinkle-text">
              <p>
                In spring 2024, our founder Jeffrey was helping a friend move into a Tulsa
                apartment with no in-unit laundry. The nearest laundromat was four blocks away —
                packed on weekends, empty on Tuesday mornings.
              </p>
              <p>
                He started talking to the owner, Rosa, who'd run the place 22 years. She told him
                she'd love more business during slow hours but had no way to reach new customers.
                She'd tried a Yelp ad once. It didn't work.
              </p>
              <p>
                That conversation led to a spreadsheet, then a group chat, then a borrowed van,
                then three test orders. Those three turned into forty. Then four hundred. Then a
                company.
              </p>
              <p>
                Looppr runs on one belief: the infrastructure already exists. The laundromats are
                there. The drivers are there. The customers are there. Someone just had to connect
                them properly — and make it good enough that people come back.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {ORIGIN_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-linen-soft p-6">
                <p className="font-display text-3xl font-semibold text-periwinkle">{s.value}</p>
                <p className="mt-1.5 text-sm text-periwinkle-text">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen-soft px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              What we believe
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Four things we won't compromise on
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-line bg-white p-7">
                <h3 className="text-base font-semibold text-ink">{v.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/60">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              The team
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Built by people who've done this before
            </h2>
          </div>
          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((person) => (
              <div key={person.name} className="rounded-2xl border border-line bg-linen-soft p-7">
                <span
                  className={`flex h-13 w-13 items-center justify-center rounded-full text-base font-semibold ${person.bg} ${person.text}`}
                >
                  {person.initials}
                </span>
                <p className="mt-4 text-sm font-semibold text-ink">{person.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-periwinkle">{person.role}</p>
                <p className="mt-3 text-xs leading-relaxed text-periwinkle-text">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-success px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1140px] gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/70">
              Local impact
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Keeping dollars in the neighborhood
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.75] text-white/85">
              Every order pays a local laundromat owner, employs a local driver, and saves a
              local customer time. We're not extracting value from a community — we're
              circulating it.
            </p>
            <p className="mt-4 text-[15.5px] leading-[1.75] text-white/85">
              In our first pilot city, Looppr sent over $60,000 to local partners in under six
              months. As we grow into Edmond and OKC, that's the number we track most carefully —
              not just orders, but how much local owners earned.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {IMPACT_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/20 bg-white/10 p-6">
                <p className="font-display text-2xl font-semibold text-white">{s.value}</p>
                <p className="mt-1 text-xs leading-snug text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-footer px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Come be part of it.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-periwinkle-muted">
            Whether you're a customer, a laundromat owner, or someone who wants to drive — there's
            a place for you here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button to="/signup" variant="primary" className="px-8! py-4!">
              Schedule your first pickup
            </Button>
            <Button to="/contact" variant="ghost-light">
              Get in touch
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
