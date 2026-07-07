// Regenerates public/sitemap.xml from src/seo/publicPages.js so the
// sitemap can never drift out of sync with the actual public route list.
// Runs automatically before every `npm run build` (see package.json
// "prebuild"); safe to run manually too: `node scripts/generate-sitemap.mjs`.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PUBLIC_PAGES } from '../src/seo/publicPages.js'

const SITE_URL = (process.env.VITE_SITE_URL || 'https://getlooppr.com').replace(/\/+$/, '')
const OUT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')

const today = new Date().toISOString().slice(0, 10)

const urlEntries = PUBLIC_PAGES.map(({ path: routePath, changefreq, priority }) => {
  // No trailing slash on non-root paths — must match the exact react-router
  // route strings in App.jsx, since this is a client-rendered SPA with no
  // server-side trailing-slash normalization.
  const loc = routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
}).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`

writeFileSync(OUT_PATH, xml, 'utf8')
console.log(`Wrote ${PUBLIC_PAGES.length} URLs to ${OUT_PATH}`)
