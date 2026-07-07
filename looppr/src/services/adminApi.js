import { api } from './api'

export function fetchStats() {
  return api.get('/admin/stats').then((res) => res.data)
}

export function fetchCustomers() {
  return api.get('/admin/customers').then((res) => res.data)
}

export function fetchAllPickups(filters = {}) {
  return api.get('/admin/pickups', { params: filters }).then((res) => res.data)
}

export function sendPaymentRequest(id) {
  return api.post(`/admin/pickups/${id}/send-payment-request`).then((res) => res.data)
}

export function updateOrderStatus(id, status) {
  return api.patch(`/admin/pickups/${id}/status`, { status }).then((res) => res.data)
}
