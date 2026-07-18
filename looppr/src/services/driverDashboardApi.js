import { driverApi } from './driverApi'

export function fetchDriverOverview() {
  return driverApi.get('/driver/overview').then((res) => res.data)
}

export function fetchDriverEarnings() {
  return driverApi.get('/driver/earnings').then((res) => res.data)
}

export function fetchIncomingDeliveries() {
  return driverApi.get('/driver/deliveries/incoming').then((res) => res.data)
}

export function fetchMyDeliveries() {
  return driverApi.get('/driver/deliveries/mine').then((res) => res.data)
}

export function acceptDelivery(id) {
  return driverApi.post(`/driver/deliveries/${id}/accept`).then((res) => res.data)
}

export function rejectDelivery(id, reason) {
  return driverApi.post(`/driver/deliveries/${id}/reject`, { reason }).then((res) => res.data)
}

export function updateDeliveryStage(id, action) {
  return driverApi.patch(`/driver/deliveries/${id}/stage`, { action }).then((res) => res.data)
}

export function confirmDeliveryWeight(id, actualWeightLbs) {
  return driverApi.patch(`/driver/deliveries/${id}/weight`, { actualWeightLbs }).then((res) => res.data)
}

export function updateAvailability(availability) {
  return driverApi.patch('/driver/availability', { availability }).then((res) => res.data)
}

export function updateLocation(lat, lng) {
  return driverApi.patch('/driver/location', { lat, lng }).then((res) => res.data)
}

export function updateDriverProfile(payload) {
  return driverApi.patch('/driver/profile', payload).then((res) => res.data)
}
