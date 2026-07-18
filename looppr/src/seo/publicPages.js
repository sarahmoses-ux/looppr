// Single source of truth for crawlable public routes. Used both by each
// page's own <SEO title description keywords> lookup and by
// scripts/generate-sitemap.mjs (to emit sitemap.xml). Keep this list, the
// routes in App.jsx, and robots.txt's Disallow rules in sync — nothing else
// derives them automatically.
//
// `keywords` is optional and omitted on pages where keyword targeting isn't
// meaningful (legal pages, plain sign-in forms) — meta keywords carries
// negligible ranking weight with modern search engines, so it's not worth
// forcing onto every entry.
//
// Plain data only (no Vite-only syntax like `import.meta.env` or asset
// imports) so scripts/generate-sitemap.mjs can import it directly under
// plain Node during `npm run build`.
export const PUBLIC_PAGES = [
  {
    path: '/',
    title: null, // Landing uses the bare default title
    description:
      'Looppr — laundry pickup and delivery in minutes. A trusted local laundry pro washes and folds your clothes, then delivers them back to your door.',
    keywords: [
      'laundry pickup and delivery', 'laundry service', 'laundry near me', 'wash and fold',
      'laundry marketplace', 'laundromat', 'looppr laundry', 'getlooppr',
    ],
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    path: '/signup',
    title: 'Create your account',
    description: 'Create a free Looppr account and book your first laundry pickup and delivery in a couple of minutes.',
    keywords: ['laundry pickup and delivery', 'laundry service sign up', 'laundry app'],
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/guest/book',
    title: 'Request a pickup as a guest',
    description: 'Request laundry pickup and delivery without creating an account — pay once your quote is ready.',
    keywords: ['laundry pickup and delivery', 'guest laundry order', 'laundry pickup'],
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
    description: 'Looppr connects Oklahoma laundry pros with neighbors who need wash, fold & delivery — learn about our laundry marketplace and mission.',
    keywords: ['laundry marketplace', 'laundry service', 'about looppr', 'looppr laundry', 'getlooppr laundry'],
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/contact',
    title: 'Contact us',
    description: 'Get in touch with the Looppr team — questions about laundry pickup & delivery orders, partnerships, or press.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/laundromats',
    title: 'Laundromat partner sign-up',
    description: 'Join the Looppr laundry marketplace — partner your laundromat to reach new wash & fold and dry cleaning customers across the Oklahoma metro.',
    keywords: ['laundry marketplace', 'laundromat', 'laundromat partner', 'dry cleaning', 'wash and fold', 'laundry service near me'],
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/drive',
    title: 'Drive with Looppr',
    description: 'Earn on your schedule delivering laundry pickup & delivery orders for Looppr in the Oklahoma metro.',
    keywords: ['laundry pickup and delivery driver', 'delivery driver jobs', 'laundry delivery'],
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Looppr laundry service pricing — pay by the pound for laundry pickup and delivery, or subscribe to Looppr+ for free delivery on every order.',
    keywords: ['laundry service pricing', 'laundry pickup and delivery cost', 'wash and fold', 'same-day laundry'],
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/business',
    title: 'Looppr for business',
    description: 'LoopprBiz — hotel laundry services and linen turnaround for hotels, gyms, Airbnb hosts & med spas, with an 8-hour SLA and monthly invoicing.',
    keywords: ['hotel laundry services', 'commercial laundry service', 'linen service', 'same-day laundry', 'laundry service'],
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/cities',
    title: 'Cities & coverage',
    description: 'Find laundry pickup and delivery near you — see where Looppr laundry service is available, launching in OKC, Edmond, Norman & Moore.',
    keywords: ['laundry near me', 'laundry pickup and delivery', 'laundry service coverage area', 'laundromat near me', 'laundry pickup'],
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    path: '/faq',
    title: 'Help & FAQ',
    description: 'Answers to common questions about Looppr laundry pickup windows, pricing, and delivery.',
    keywords: ['laundry service faq', 'laundry pickup and delivery questions', 'what is looppr', 'how does looppr work'],
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

  // Business Portal — self-serve account creation/sign-in are indexed for
  // the same reason /signup and /login (customer) are: real prospects land
  // here directly from search. Dashboard routes behind auth, and the
  // verify-email/forgot-password steps, are deliberately excluded (see
  // robots.txt) — same pattern as the customer app.
  {
    path: '/business/login',
    title: 'Business login',
    description: 'Sign in to the Looppr Business Portal to manage your hotel laundry services, laundry requests, and invoices.',
    keywords: ['hotel laundry services login', 'business laundry portal'],
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/business/signup',
    title: 'Create your business account',
    description: 'Create a free Looppr Business account for hotel laundry services, commercial laundry pickup and delivery, and monthly invoicing.',
    keywords: ['hotel laundry services', 'commercial laundry service sign up'],
    changefreq: 'monthly',
    priority: 0.6,
  },

  // Partner Portal (laundromats).
  {
    path: '/partners/login',
    title: 'Partner login',
    description: 'Sign in to the Looppr Partner Portal to manage incoming laundry orders, capacity, and earnings.',
    keywords: ['laundry marketplace partner login'],
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/partners/signup',
    title: 'Become a Looppr partner',
    description: 'Create a Looppr Partner account to join our laundry marketplace and start receiving wash & fold and dry cleaning orders.',
    keywords: ['laundry marketplace', 'laundromat', 'become a laundromat partner', 'dry cleaning partner'],
    changefreq: 'monthly',
    priority: 0.6,
  },

  // Driver Portal.
  {
    path: '/drive/login',
    title: 'Driver login',
    description: 'Sign in to the Looppr Driver Portal to manage laundry pickup and delivery routes and earnings.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/drive/signup',
    title: 'Become a Looppr driver',
    description: 'Create a Looppr Driver account and start earning on your schedule delivering laundry pickup and delivery orders.',
    keywords: ['laundry delivery driver jobs'],
    changefreq: 'monthly',
    priority: 0.6,
  },
]
