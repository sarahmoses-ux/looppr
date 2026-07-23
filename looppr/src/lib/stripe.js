import { loadStripe } from '@stripe/stripe-js'

// Module-level singleton — loadStripe() fetches Stripe.js, so every caller
// (Orders.jsx, GuestRequestStatus.jsx) should share one promise instead of
// re-fetching it per mount.
let stripePromise

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim()

export function hasStripeConfig() {
  return Boolean(publishableKey)
}

export function getStripe() {
  if (!publishableKey) return null

  stripePromise ??= loadStripe(publishableKey)
  return stripePromise
}
