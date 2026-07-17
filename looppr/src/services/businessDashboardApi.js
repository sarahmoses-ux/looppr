import { businessApi } from './businessApi'

export function fetchBusinessOverview() {
  return businessApi.get('/business/overview').then((res) => res.data)
}

export function fetchBusinessPickups() {
  return businessApi.get('/business/pickups').then((res) => res.data)
}

export function createBusinessPickup(payload) {
  return businessApi.post('/business/pickups', payload).then((res) => res.data)
}
