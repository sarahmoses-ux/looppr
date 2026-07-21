import { api } from './api'

export function createGuestPickup(payload) {
  return api.post('/pickups/guest', payload).then((res) => res.data)
}

export function fetchGuestPickup(id, token) {
  return api.get(`/pickups/guest/${id}`, { params: { token } }).then((res) => res.data)
}

// Creates (or reuses) a Stripe PaymentIntent for this guest request. Token-gated
// the same way every other guest action is.
export function createGuestPaymentIntent(id, token) {
  return api.post(`/pickups/guest/${id}/pay/intent`, { token }).then((res) => res.data)
}

// Called right after Stripe confirms the charge client-side, so the UI can
// flip to "paid" immediately instead of waiting on the webhook.
export function confirmGuestPayment(id, token) {
  return api.post(`/pickups/guest/${id}/pay/confirm`, { token }).then((res) => res.data)
}
