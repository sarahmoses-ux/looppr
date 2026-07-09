import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
} from '../seo/siteConfig'

// Renders per-page <title>, meta description, canonical link, robots
// directive, and Open Graph / Twitter tags. Canonical + og:url are derived
// from the current route so every page (including ones we forget to touch)
// always points at itself instead of a stale/duplicate URL.
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  noindex = false,
  image = DEFAULT_OG_IMAGE,
  jsonLd,
}) {
  const { pathname } = useLocation()
  const canonicalPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/'
  const url = `${SITE_URL}${canonicalPath}`
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
    </Helmet>
  )
}
