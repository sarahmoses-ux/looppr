import { api } from './api'

export function createPickup(payload) {
  return api.post('/pickups', payload).then((res) => res.data)
}

export function fetchMyPickups() {
  return api.get('/pickups/me').then((res) => res.data)
}
