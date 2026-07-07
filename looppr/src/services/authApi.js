import { api } from './api'

export function registerClient(payload) {
  return api.post('/auth/client/register', payload).then((res) => res.data)
}

export function loginClient(payload) {
  return api.post('/auth/client/login', payload).then((res) => res.data)
}

export function verifyLoginOtp(challengeToken, code) {
  return api
    .post('/auth/client/login/verify-otp', { challengeToken, code })
    .then((res) => res.data)
}

export function resendLoginOtp(challengeToken) {
  return api
    .post('/auth/client/login/resend-otp', { challengeToken })
    .then((res) => res.data)
}

export function refreshSession() {
  return api.post('/auth/refresh').then((res) => res.data)
}

export function logout() {
  return api.post('/auth/logout').then((res) => res.data)
}

export function fetchMe() {
  return api.get('/auth/me').then((res) => res.data)
}

export function updateProfile(payload) {
  return api.patch('/auth/me', payload).then((res) => res.data)
}

export function changePassword(payload) {
  return api.post('/auth/change-password', payload).then((res) => res.data)
}

export function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email }).then((res) => res.data)
}

export function resetPassword(payload) {
  return api.post('/auth/reset-password', payload).then((res) => res.data)
}
