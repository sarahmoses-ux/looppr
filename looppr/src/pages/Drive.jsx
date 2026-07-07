import SEO from '../components/SEO'
import PartnerLeadForm from '../components/PartnerLeadForm'
import { PUBLIC_PAGES } from '../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/drive')

const BENEFITS = [
  {
    title: 'Earn on your schedule',
    body: 'Pick up and drop off laundry orders whenever works for you.',
  },
  {
    title: 'Simple routes',
    body: 'Short, local pickups and deliveries across the OKC metro — no long hauls.',
  },
  {
    title: 'Get paid weekly',
    body: 'Track your earnings and get paid on a predictable schedule.',
  },
]

export default function Drive() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Drive</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Drive with Looppr
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/70">
        We're recruiting drivers ahead of our July 23, 2026 launch across OKC, Edmond, Norman &amp;
        Moore. Apply now and we'll reach out as we get closer to launch.
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
        <h2 className="font-display text-xl font-semibold text-ink">Apply to drive</h2>
        <p className="mt-1 text-sm text-ink/55">
          Tell us a bit about yourself and we'll reach out with next steps.
        </p>
        <div className="mt-6">
          <PartnerLeadForm type="driver" submitLabel="Submit application" />
        </div>
      </div>
    </div>
  )
}
