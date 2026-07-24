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

export function fetchPartnerApplications(filters = {}) {
  return api.get('/admin/partners', { params: filters }).then((res) => res.data)
}

export function fetchDriverApplications(filters = {}) {
  return api.get('/admin/drivers', { params: filters }).then((res) => res.data)
}

export function approvePartnerApplication(id) {
  return api.post(`/admin/partners/${id}/approve`).then((res) => res.data)
}

export function rejectPartnerApplication(id, reason) {
  return api.post(`/admin/partners/${id}/reject`, { reason }).then((res) => res.data)
}

export function approveDriverApplication(id) {
  return api.post(`/admin/drivers/${id}/approve`).then((res) => res.data)
}

export function rejectDriverApplication(id, reason) {
  return api.post(`/admin/drivers/${id}/reject`, { reason }).then((res) => res.data)
}
