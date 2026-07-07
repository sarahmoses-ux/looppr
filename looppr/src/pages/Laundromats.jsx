import SEO from '../components/SEO'
import PartnerLeadForm from '../components/PartnerLeadForm'
import { PUBLIC_PAGES } from '../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/laundromats')

const BENEFITS = [
  {
    title: 'New customers, no marketing spend',
    body: "We bring the orders — you focus on what you're already great at.",
  },
  {
    title: 'You keep running your business',
    body: 'Looppr handles pickup, delivery, and customer support. You just wash and fold.',
  },
  {
    title: 'Simple payouts',
    body: 'Get paid for every order you complete, on a predictable schedule.',
  },
]

export default function Laundromats() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        For laundromats
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Partner your laundromat with Looppr
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/70">
        We're launching across the OKC metro and looking for great local laundromats to partner
        with. Reach new customers without spending a dollar on marketing.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title}>
            <h2 className="font-display text-lg font-semibold text-ink">{b.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink">Get in touch</h2>
        <p className="mt-1 text-sm text-ink/55">
          Tell us a bit about your business and we'll reach out with next steps.
        </p>
        <div className="mt-6">
          <PartnerLeadForm type="laundromat" submitLabel="Request partnership" />
        </div>
      </div>
    </div>
  )
}
