// Single source of truth for crawlable public routes. Used both by App.jsx
// (to feed title/description into <SEO>/<ComingSoon>) and by
// scripts/generate-sitemap.mjs (to emit sitemap.xml). Keep this list, the
// routes in App.jsx, and robots.txt's Disallow rules in sync — nothing else
// derives them automatically.
//
// Plain data only (no Vite-only syntax like `import.meta.env` or asset
// imports) so scripts/generate-sitemap.mjs can import it directly under
// plain Node during `npm run build`.
export const PUBLIC_PAGES = [
  {
    path: '/',
    title: null, // Landing uses the bare default title
    description:
      'Looppr — book a laundry pickup in minutes. A trusted local laundry pro washes and folds your clothes, then delivers them back to your door.',
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    path: '/signup',
    title: 'Create your account',
    description: 'Create a free Looppr account and book your first laundry pickup in a couple of minutes.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/guest/book',
    title: 'Request a pickup as a guest',
    description: 'Request a Looppr laundry pickup without creating an account — pay once your quote is ready.',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    path: '/login',
    title: 'Sign in to your account',
    description: 'Sign in to Looppr to track your laundry orders and schedule your next pickup.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/about',
    title: 'About Looppr',
    description: 'Looppr connects Oklahoma laundry pros with neighbors who need wash, fold & delivery — learn about our mission.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/contact',
    title: 'Contact us',
    description: 'Get in touch with the Looppr team — questions about orders, partnerships, or press.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/laundromats',
    title: 'Laundromat partner sign-up',
    description: 'Partner your laundromat with Looppr to reach new customers across the Oklahoma metro.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/drive',
    title: 'Drive with Looppr',
    description: 'Earn on your schedule delivering laundry orders for Looppr in the Oklahoma metro.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/cities',
    title: 'Cities & coverage',
    description: 'See where Looppr laundry pickup & delivery is available — launching in OKC, Edmond, Norman & Moore.',
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    path: '/faq',
    title: 'Help & FAQ',
    description: 'Answers to common questions about Looppr pickup windows, pricing, and delivery.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description: "Looppr's privacy policy — how we collect, use, and protect your information.",
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    path: '/terms',
    title: 'Terms of service',
    description: "Looppr's terms of service for customers, laundry partners, and drivers.",
    changefreq: 'yearly',
    priority: 0.3,
  },
]
