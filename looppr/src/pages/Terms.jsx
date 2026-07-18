import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd } from '../seo/structuredData'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/terms')
const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Terms of service', path: '/terms' }])

const SECTIONS = [
  {
    heading: 'Using Looppr',
    body: `Looppr connects customers with independent local laundry businesses ("laundry partners")
      for wash, fold, pickup, and delivery service. You must be at least 18 years old and able to
      provide accurate pickup/delivery information to use the service.`,
  },
  {
    heading: 'Pricing & payment',
    body: `Wash & fold is priced at $1.59 per pound, plus a $4.99 delivery fee (waived on your first
      two orders, or on every order with a Looppr+ subscription). Your card is charged once your
      order is confirmed. Prices are subject to change with notice on the site.`,
  },
  {
    heading: 'Order handling',
    body: `Laundry partners handle your items with care, but Looppr and its partners are not liable
      for ordinary wear, pre-existing damage, or items left in pockets. Please remove valuables and
      follow any care instructions in your order notes.`,
  },
  {
    heading: 'Cancellations',
    body: `You can cancel a pickup before it's collected. Once your laundry has been picked up, the
      order can no longer be cancelled, though you can always reach out through our contact page if
      something's gone wrong.`,
  },
  {
    heading: 'Laundromat & driver partners',
    body: `Laundromat and driver partners operate as independent businesses/contractors, not Looppr
      employees, under separate partner terms provided during onboarding.`,
  },
  {
    heading: 'Changes to these terms',
    body: `We may update these terms as the service evolves. Continued use of Looppr after a change
      means you accept the updated terms.`,
  },
]

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} jsonLd={BREADCRUMB_JSON_LD} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Terms of service
      </h1>
      <p className="mt-4 text-sm text-ink/50">Last updated July 2026</p>

      <div className="mt-10 space-y-10">
        {SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display text-xl font-semibold text-ink">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
