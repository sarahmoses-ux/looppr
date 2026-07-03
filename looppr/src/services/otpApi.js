import { api } from './api'

export function sendOtp() {
  return api.post('/auth/otp/send').then((res) => res.data)
}

export function verifyOtp(code) {
  return api.post('/auth/otp/verify', { code }).then((res) => res.data)
}
