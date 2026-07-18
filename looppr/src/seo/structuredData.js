// Schema.org JSON-LD builders. Kept separate from siteConfig.js (which holds
// simple string/number constants) since these return full structured-data
// objects, some built per-page (breadcrumbs).
import logoTransparent from '../assets/looppr-mark-transparent.png'
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, SOCIAL_PROFILES } from './siteConfig'

const LOGO_URL = `${SITE_URL}${logoTransparent}`

// Cities Looppr actually serves at launch — reused across LocalBusiness and
// Service schema so "areaServed" never drifts out of sync between them.
const AREA_SERVED = [
  { '@type': 'City', name: 'Oklahoma City, OK' },
  { '@type': 'City', name: 'Edmond, OK' },
  { '@type': 'City', name: 'Norman, OK' },
  { '@type': 'City', name: 'Moore, OK' },
]

// Rendered sitewide (see PublicLayout.jsx) — every public page should
// identify the publishing organization.
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  sameAs: SOCIAL_PROFILES,
}

// Rendered sitewide. No SearchAction/potentialAction — Looppr has no
// site-search endpoint, so adding one would be inaccurate structured data.
export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

// Looppr is a service-area business (it comes to the customer; there's no
// single storefront customers visit) — per Google's structured-data
// guidance for this model, `areaServed` is specified and no fabricated
// street address is included. Region/country are accurate; a fictitious
// street address would not be.
export const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  url: SITE_URL,
  image: LOGO_URL,
  description: DEFAULT_DESCRIPTION,
  address: { '@type': 'PostalAddress', addressRegion: 'OK', addressCountry: 'US' },
  areaServed: AREA_SERVED,
  sameAs: SOCIAL_PROFILES,
  priceRange: '$',
}

export function serviceJsonLd({ serviceType, description, price }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    areaServed: AREA_SERVED,
    ...(price && {
      offers: { '@type': 'Offer', priceCurrency: 'USD', price, description },
    }),
  }
}

// `crumbs` is an ordered array of { name, path } ending at the current page;
// Home is added automatically. `path` is a route like '/pricing'.
export function breadcrumbJsonLd(crumbs) {
  const items = [{ name: 'Home', path: '/' }, ...crumbs]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '/' : item.path}`,
    })),
  }
}
