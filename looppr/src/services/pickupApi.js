import { api } from './api'

export function createPickup(payload) {
  return api.post('/pickups', payload).then((res) => res.data)
}

export function fetchMyPickups() {
  return api.get('/pickups/me').then((res) => res.data)
}

export function fetchMyStats() {
  return api.get('/pickups/me/stats').then((res) => res.data)
}

// Creates (or reuses) a Stripe PaymentIntent for this order and returns its
// clientSecret for the Payment Element (see components/StripePaymentForm.jsx).
export function createPaymentIntent(id) {
  return api.post(`/pickups/${id}/pay/intent`).then((res) => res.data)
}

// Called right after Stripe confirms the charge client-side, so the UI can
// flip to "paid" immediately instead of waiting on the webhook.
export function confirmPayment(id) {
  return api.post(`/pickups/${id}/pay/confirm`).then((res) => res.data)
}
