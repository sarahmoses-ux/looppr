import { api } from './api'

export function createGuestPickup(payload) {
  return api.post('/pickups/guest', payload).then((res) => res.data)
}

export function fetchGuestPickup(id, token) {
  return api.get(`/pickups/guest/${id}`, { params: { token } }).then((res) => res.data)
}

// Simulated payment confirmation — placeholder for real Stripe checkout
// (see backend controllers for the "seam" comment). Token-gated the same
// way every other guest action is.
export function payGuestOrder(id, token) {
  return api.post(`/pickups/guest/${id}/pay`, { token }).then((res) => res.data)
}
