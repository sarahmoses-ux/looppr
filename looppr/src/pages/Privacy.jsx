import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd } from '../seo/structuredData'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/privacy')
const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Privacy policy', path: '/privacy' }])

const SECTIONS = [
  {
    heading: 'Information we collect',
    body: `When you create an account, book a pickup, or join our waitlist, we collect your name,
      email address, phone number, and pickup/delivery address. When you pay for an order, payment
      details are handled by our payment processor — we don't store your full card number.`,
  },
  {
    heading: 'How we use it',
    body: `We use your information to schedule and fulfill orders, send you order and payment status
      updates, communicate about your account, and improve the service. We do not sell your personal
      information to third parties.`,
  },
  {
    heading: 'Who we share it with',
    body: `Your pickup address and contact details are shared with the local laundry partner
      fulfilling your order, and, where applicable, the driver delivering it. We share information
      with service providers who help us operate Looppr (payment processing, email delivery, hosting)
      under agreements that limit their use of your data to providing that service.`,
  },
  {
    heading: 'Your choices',
    body: `You can update your name and phone number, and turn off non-essential email notifications,
      any time from your account settings. Security-related emails (sign-in codes, password resets)
      can't be turned off, since they're how we keep your account secure. You can request deletion of
      your account by contacting us.`,
  },
  {
    heading: 'Data retention',
    body: `We keep order and account records for as long as your account is active and as needed to
      meet legal, accounting, and business requirements.`,
  },
  {
    heading: 'Contact us',
    body: `Questions about this policy or your data? Reach us through our contact page.`,
  },
]

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} jsonLd={BREADCRUMB_JSON_LD} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Privacy policy
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
