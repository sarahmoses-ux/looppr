import { driverApi } from './driverApi'

export function registerDriver(payload) {
  return driverApi.post('/driver-auth/register', payload).then((res) => res.data)
}

export function loginDriver(payload) {
  return driverApi.post('/driver-auth/login', payload).then((res) => res.data)
}

export function verifyDriverEmail(email, code) {
  return driverApi.post('/driver-auth/verify-email', { email, code }).then((res) => res.data)
}

export function resendDriverVerification(email) {
  return driverApi.post('/driver-auth/resend-verification', { email }).then((res) => res.data)
}

export function refreshDriverSession() {
  return driverApi.post('/driver-auth/refresh').then((res) => res.data)
}

export function logoutDriver() {
  return driverApi.post('/driver-auth/logout').then((res) => res.data)
}

export function fetchDriverMe() {
  return driverApi.get('/driver-auth/me').then((res) => res.data)
}

export function driverForgotPassword(email) {
  return driverApi.post('/driver-auth/forgot-password', { email }).then((res) => res.data)
}

export function driverResetPassword(payload) {
  return driverApi.post('/driver-auth/reset-password', payload).then((res) => res.data)
}
