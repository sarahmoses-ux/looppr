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

// Simulated payment confirmation — placeholder for real Stripe checkout.
export function payMyOrder(id) {
  return api.post(`/pickups/${id}/pay`).then((res) => res.data)
}
