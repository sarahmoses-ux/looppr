import { partnerApi } from './partnerApi'

export function fetchPartnerOverview() {
  return partnerApi.get('/partner/overview').then((res) => res.data)
}

export function fetchPartnerEarnings() {
  return partnerApi.get('/partner/earnings').then((res) => res.data)
}

export function fetchIncomingOrders() {
  return partnerApi.get('/partner/orders/incoming').then((res) => res.data)
}

export function fetchMyOrders() {
  return partnerApi.get('/partner/orders/mine').then((res) => res.data)
}

export function acceptOrder(id) {
  return partnerApi.post(`/partner/orders/${id}/accept`).then((res) => res.data)
}

export function rejectOrder(id, reason) {
  return partnerApi.post(`/partner/orders/${id}/reject`, { reason }).then((res) => res.data)
}

export function updateOrderStage(id, action) {
  return partnerApi.patch(`/partner/orders/${id}/stage`, { action }).then((res) => res.data)
}

export function updateAvailability(availability) {
  return partnerApi.patch('/partner/availability', { availability }).then((res) => res.data)
}

export function updatePartnerProfile(payload) {
  return partnerApi.patch('/partner/profile', payload).then((res) => res.data)
}
