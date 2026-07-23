// Single source of truth for FAQ content — feeds the visible accordion on
// /faq (see pages/Faq.jsx) AND that page's FAQPage JSON-LD, which is built
// directly from this array. Google requires FAQ schema to match visible
// on-page content, so never add an entry here without it also rendering in
// the accordion — the two can't be allowed to drift apart.
export const FAQ_ITEMS = [
  {
    question: 'What is Looppr?',
    answer:
      "Looppr is a laundry marketplace that connects you with vetted, independent local laundromats through one simple online platform. Instead of managing your own laundry pickup, you book once and Looppr handles matching you to a nearby laundry partner, scheduling, and delivery.",
  },
  {
    question: 'How does Looppr work?',
    answer:
      "Book a pickup online (as a guest or with an account), choose a pickup window, and a local Looppr laundry partner washes and folds your order. We bring it back to your door and email you the moment it's ready — no drop-off, no driving, no waiting in a laundromat.",
  },
  {
    question: 'Do I need to create an account to book a pickup?',
    answer:
      'No. You can request a pickup as a guest with just your name, email, and phone — no account required. If you decide to become a regular, creating an account lets you track orders, payment history, and future bookings in one place.',
  },
  {
    question: 'Is Looppr available in my area?',
    answer:
      'Looppr is available now across the OKC metro - Oklahoma City, Edmond, Norman, and Moore - with Texas and Georgia cities following in 2027. Visit our cities & coverage page to check your city and join the waitlist if we\'re not there yet.',
    linkTo: '/cities',
    linkLabel: 'Check coverage in your city',
  },
  {
    question: 'How does laundry pickup work?',
    answer:
      "Choose a morning, afternoon, or evening window when you book. A Looppr driver collects your laundry from your door at that time — no need to be present for drop-off if you leave it out as arranged — and it goes straight to your matched local laundromat for washing.",
  },
  {
    question: 'How long does a typical order take?',
    answer:
      "About 24 hours on average from pickup to delivery, depending on your laundry pro's current load and the size of your order. Need it faster? An Express 4-hour option is available for an extra fee.",
  },
  {
    question: 'How does Looppr pricing work?',
    answer:
      "It's $1.59 per pound for wash & fold, plus a $4.99 delivery fee — and delivery is free on your first two orders. If you order often, Looppr+ ($14.99/mo) waives the delivery fee on every order.",
  },
  {
    question: 'How much does laundry delivery cost?',
    answer:
      'Delivery is $4.99 per order — and completely free on your first two orders, no subscription needed. Looppr+ members ($14.99/mo) get free delivery on every order after that.',
  },
  {
    question: 'Who actually washes my clothes?',
    answer:
      "A vetted, independent local laundromat — not a faceless warehouse. Every partner is a real laundry business already serving your neighborhood.",
  },
  {
    question: 'How do I pay, and when am I charged?',
    answer:
      'You add a card on file, and it\'s charged once your order is confirmed. No cash, no surprise fees.',
  },
  {
    question: 'Can I track my order in real time?',
    answer:
      'Yes — every order shows a live status timeline, from request submitted through pickup, washing, and delivery, so you always know exactly where things stand.',
  },
  {
    question: 'I own a laundromat — can I partner with Looppr?',
    answer: 'Absolutely. Visit our laundromat partner page to get started.',
    linkTo: '/laundromats',
    linkLabel: 'Partner with Looppr',
  },
  {
    question: 'Can I earn money delivering for Looppr?',
    answer: "We're recruiting drivers ahead of launch — see current openings and apply.",
    linkTo: '/drive',
    linkLabel: 'Drive with Looppr',
  },
]
