import { businessApi } from './businessApi'

export function registerBusiness(payload) {
  return businessApi.post('/business-auth/register', payload).then((res) => res.data)
}

export function loginBusiness(payload) {
  return businessApi.post('/business-auth/login', payload).then((res) => res.data)
}

export function verifyBusinessEmail(email, code) {
  return businessApi.post('/business-auth/verify-email', { email, code }).then((res) => res.data)
}

export function resendBusinessVerification(email) {
  return businessApi.post('/business-auth/resend-verification', { email }).then((res) => res.data)
}

export function refreshBusinessSession() {
  return businessApi.post('/business-auth/refresh').then((res) => res.data)
}

export function logoutBusiness() {
  return businessApi.post('/business-auth/logout').then((res) => res.data)
}

export function fetchBusinessMe() {
  return businessApi.get('/business-auth/me').then((res) => res.data)
}

export function updateBusinessProfile(payload) {
  return businessApi.patch('/business-auth/me', payload).then((res) => res.data)
}

export function businessForgotPassword(email) {
  return businessApi.post('/business-auth/forgot-password', { email }).then((res) => res.data)
}

export function businessResetPassword(payload) {
  return businessApi.post('/business-auth/reset-password', payload).then((res) => res.data)
}
