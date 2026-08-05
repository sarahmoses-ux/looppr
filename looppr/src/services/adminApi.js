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

export function updatePartnerStatus(id, accountStatus) {
  return api.patch(`/admin/partners/${id}/status`, { accountStatus }).then((res) => res.data)
}

export function updateDriverStatus(id, accountStatus) {
  return api.patch(`/admin/drivers/${id}/status`, { accountStatus }).then((res) => res.data)
}

export function assignPartnerToOrder(pickupId, partnerUserId) {
  return api.post(`/admin/pickups/${pickupId}/assign-partner`, { partnerUserId }).then((res) => res.data)
}

export function assignDriverToOrder(pickupId, driverUserId) {
  return api.post(`/admin/pickups/${pickupId}/assign-driver`, { driverUserId }).then((res) => res.data)
}

export function fetchContactMessages(filters = {}) {
  return api.get('/admin/contact-messages', { params: filters }).then((res) => res.data)
}

export function resolveContactMessage(id) {
  return api.post(`/admin/contact-messages/${id}/resolve`).then((res) => res.data)
}

export function fetchBusinessLeads(filters = {}) {
  return api.get('/admin/business-leads', { params: filters }).then((res) => res.data)
}

export function markBusinessLeadContacted(id) {
  return api.post(`/admin/business-leads/${id}/mark-contacted`).then((res) => res.data)
}

export function fetchBusinessAccounts() {
  return api.get('/admin/business-accounts').then((res) => res.data)
}

export function fetchActivityLog(filters = {}) {
  return api.get('/admin/activity-log', { params: filters }).then((res) => res.data)
}

export function fetchIntakeStats() {
  return api.get('/admin/data-collection').then((res) => res.data)
}

export function fetchAdminUsers() {
  return api.get('/admin/admin-users').then((res) => res.data)
}

export function createAdminUser(payload) {
  return api.post('/admin/admin-users', payload).then((res) => res.data)
}

export function updateAdminUserRole(id, adminRole) {
  return api.patch(`/admin/admin-users/${id}/role`, { adminRole }).then((res) => res.data)
}
