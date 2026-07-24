// Single source of truth for customer subscription pricing — feeds both the
// homepage pricing section (pages/Landing.jsx) and the dedicated pricing
// page (pages/Pricing.jsx). The two must always show identical plans/prices/
// features, so neither page defines its own copy of this data.
export const CUSTOMER_PLANS = [
  {
    name: 'Free',
    price: '$0',
    unit: '/mo',
    detail: 'No subscription. Order when you need it.',
    features: ['Pay per order', 'Schedule pickups', 'Track orders', 'Standard customer support'],
    cta: 'Get started free',
    to: '/guest/book',
    highlight: false,
  },
  {
    name: 'Looppr+',
    price: '$14.99',
    unit: '/mo',
    detail: 'Pays for itself at 3 orders a month.',
    features: [
      '$1.59 per lb, wash & fold',
      'Free delivery on every order',
      'Priority driver matching',
      'Favorite laundromat always first',
    ],
    cta: 'Try free for 30 days',
    to: '/signup',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Looppr Gold',
    price: '$90.99',
    unit: '/mo',
    detail: 'For households that do laundry every week.',
    features: [
      'Wash up to 100 lbs of laundry per month',
      'Priority pickup & delivery',
      'Faster turnaround times',
      'Premium customer support',
    ],
    cta: 'Get Looppr Gold',
    to: '/signup',
    highlight: true,
    badge: 'Best Value',
  },
]

// Business pricing lives exclusively on pages/Business.jsx — never on the
// customer Landing/Pricing pages. Looppr Gold above is a customer
// subscription, not a business plan.
export const BUSINESS_PLANS = [
  {
    name: 'Looppr Business Starter',
    price: '$500',
    unit: '/mo',
    detail: 'For single-location businesses getting started with Looppr.',
    features: [
      'Business dashboard',
      'Dedicated account manager',
      'Scheduled commercial pickups',
      'Monthly invoicing',
      'Priority support',
      'Staff order management',
    ],
    cta: 'Contact Sales',
    to: '/business/apply',
    highlight: false,
  },
  {
    name: 'Looppr Business Enterprise',
    price: '$2,000',
    unit: '/mo',
    detail: 'For multi-location operations with higher volume.',
    features: [
      'Everything included in the Starter plan',
      'Unlimited commercial pickups',
      'Multi-location management',
      'Dedicated Customer Success Manager',
      'Priority onboarding and training',
      'Highest priority support',
      'Customized service agreements',
    ],
    cta: 'Contact Sales',
    to: '/business/apply',
    highlight: true,
  },
]
