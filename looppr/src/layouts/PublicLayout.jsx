import { Helmet } from 'react-helmet-async'
import { Outlet } from 'react-router-dom'
import BackToTop from '../components/BackToTop'
import LaunchBar from '../components/LaunchBar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ORGANIZATION_JSON_LD, WEBSITE_JSON_LD } from '../seo/structuredData'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sitewide structured data — every public page should identify the
          publishing Organization and WebSite. Separate from each page's own
          <SEO jsonLd> (title/description/canonical/page-specific schema),
          which is rendered further down the tree; react-helmet-async merges
          both without conflict since these are additive <script> tags, not
          singleton tags like <title>. */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSON_LD)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_JSON_LD)}</script>
      </Helmet>

      <div className="sticky top-0 z-40">
        <LaunchBar />
        <Navbar />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
