// Schema.org JSON-LD builders. Kept separate from siteConfig.js (which holds
// simple string/number constants) since these return full structured-data
// objects, some built per-page (breadcrumbs).
import logoTransparent from '../assets/looppr-mark-transparent.png'
import { SITE_URL, SITE_NAME, SOCIAL_PROFILES } from './siteConfig'

const LOGO_URL = `${SITE_URL}${logoTransparent}`

// How people search for/type the brand — ties branded-search variants back
// to the one Organization, per Schema.org's intended use of alternateName.
const BRAND_ALTERNATE_NAMES = ['GetLooppr', 'getlooppr', 'Looppr Laundry', 'GetLooppr Laundry']

// Explicit brand-identity statement for Organization schema — distinct from
// SEO.jsx's page-level DEFAULT_DESCRIPTION (which stays a short, punchy
// meta-description fallback) so this can spell out the marketplace/platform
// model precisely for crawlers without changing any page's visible/meta
// copy elsewhere on the site.
const ORGANIZATION_DESCRIPTION =
  'Looppr is a laundry marketplace that connects customers with vetted local laundromats through an online booking platform, offering wash & fold, dry cleaning, and laundry pickup and delivery service.'

// Cities Looppr actually serves at launch — reused across LocalBusiness and
// Service schema so "areaServed" never drifts out of sync between them.
const AREA_SERVED = [
  { '@type': 'City', name: 'Oklahoma City, OK' },
  { '@type': 'City', name: 'Edmond, OK' },
  { '@type': 'City', name: 'Norman, OK' },
  { '@type': 'City', name: 'Moore, OK' },
]

// Approximate center of the launch metro (public, well-known coordinates for
// Oklahoma City) — used only as a `geo`/`serviceArea` centroid for a
// service-area business, per Google's structured-data guidance for
// businesses with no single storefront. NOT a claimed street address.
const METRO_GEO = { '@type': 'GeoCoordinates', latitude: 35.4676, longitude: -97.5164 }
const SERVICE_AREA_GEO_CIRCLE = {
  '@type': 'GeoCircle',
  geoMidpoint: METRO_GEO,
  geoRadius: '40000', // meters — roughly covers the OKC/Edmond/Norman/Moore metro
}

// Real, currently-published contact points (visible today on
// BusinessForm.jsx / LaundromatsForm.jsx / DriveForm.jsx) — not invented for
// SEO purposes. No `telephone` — no verified public phone number exists
// anywhere in the app to publish accurately.
const CONTACT_POINTS = [
  { '@type': 'ContactPoint', contactType: 'customer service', url: `${SITE_URL}/contact` },
  { '@type': 'ContactPoint', contactType: 'sales', email: 'biz@getlooppr.com' },
  { '@type': 'ContactPoint', contactType: 'reseller', email: 'partners@getlooppr.com' },
  { '@type': 'ContactPoint', contactType: 'recruiting', email: 'drivers@getlooppr.com' },
]

// Rendered sitewide (see PublicLayout.jsx) — every public page should
// identify the publishing organization.
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: BRAND_ALTERNATE_NAMES,
  url: SITE_URL,
  logo: LOGO_URL,
  description: ORGANIZATION_DESCRIPTION,
  sameAs: SOCIAL_PROFILES,
  contactPoint: CONTACT_POINTS,
}

// Rendered sitewide. No SearchAction/potentialAction — Looppr has no
// site-search endpoint, so adding one would be inaccurate structured data.
export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: BRAND_ALTERNATE_NAMES,
  url: SITE_URL,
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

// Looppr is a service-area business (it comes to the customer; there's no
// single storefront customers visit) — per Google's structured-data
// guidance for this model, `areaServed`/`geo` describe the region served and
// no fabricated street address, phone, or opening hours are included.
// Region/country are accurate; inventing the rest would not be.
export const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  alternateName: BRAND_ALTERNATE_NAMES,
  url: SITE_URL,
  image: LOGO_URL,
  description: ORGANIZATION_DESCRIPTION,
  address: { '@type': 'PostalAddress', addressRegion: 'OK', addressCountry: 'US' },
  geo: METRO_GEO,
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
    serviceArea: SERVICE_AREA_GEO_CIRCLE,
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
