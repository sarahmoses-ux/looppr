import SEO from '../components/SEO'
import FaqAccordion from '../components/FaqAccordion'
import { FAQ_ITEMS } from '../data/faqItems'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd } from '../seo/structuredData'

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Help & FAQ', path: '/faq' }])

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/faq')

export default function Faq() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:px-8">
      <SEO
        title={PAGE_META.title}
        description={PAGE_META.description}
        keywords={PAGE_META.keywords}
        jsonLd={[FAQ_JSON_LD, BREADCRUMB_JSON_LD]}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
        Help
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Frequently asked questions
      </h1>
      <div className="mt-10">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </div>
  )
}
