import { partnerApi } from './partnerApi'

export function registerPartner(payload) {
  return partnerApi.post('/partner-auth/register', payload).then((res) => res.data)
}

export function loginPartner(payload) {
  return partnerApi.post('/partner-auth/login', payload).then((res) => res.data)
}

export function verifyPartnerEmail(email, code) {
  return partnerApi.post('/partner-auth/verify-email', { email, code }).then((res) => res.data)
}

export function resendPartnerVerification(email) {
  return partnerApi.post('/partner-auth/resend-verification', { email }).then((res) => res.data)
}

export function refreshPartnerSession() {
  return partnerApi.post('/partner-auth/refresh').then((res) => res.data)
}

export function logoutPartner() {
  return partnerApi.post('/partner-auth/logout').then((res) => res.data)
}

export function fetchPartnerMe() {
  return partnerApi.get('/partner-auth/me').then((res) => res.data)
}

export function partnerForgotPassword(email) {
  return partnerApi.post('/partner-auth/forgot-password', { email }).then((res) => res.data)
}

export function partnerResetPassword(payload) {
  return partnerApi.post('/partner-auth/reset-password', payload).then((res) => res.data)
}
