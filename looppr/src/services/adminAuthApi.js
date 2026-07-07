import { api } from './api'

export function loginAdmin(payload) {
  return api.post('/auth/admin/login', payload).then((res) => res.data)
}

export function verifyAdminLoginOtp(challengeToken, code) {
  return api
    .post('/auth/admin/login/verify-otp', { challengeToken, code })
    .then((res) => res.data)
}

export function resendAdminLoginOtp(challengeToken) {
  return api
    .post('/auth/admin/login/resend-otp', { challengeToken })
    .then((res) => res.data)
}
