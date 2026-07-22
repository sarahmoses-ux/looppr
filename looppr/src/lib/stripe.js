import { loadStripe } from '@stripe/stripe-js'

// Module-level singleton — loadStripe() fetches Stripe.js, so every caller
// (Orders.jsx, GuestRequestStatus.jsx) should share one promise instead of
// re-fetching it per mount.
let stripePromise

export function getStripe() {
  // TEMP DEBUG — remove after confirming the deployed value.
  console.log('[stripe debug] VITE_STRIPE_PUBLISHABLE_KEY:', JSON.stringify(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY))
  stripePromise ??= loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  return stripePromise
}
