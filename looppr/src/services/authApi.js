import { api } from './api'

export function registerClient(payload) {
  return api.post('/auth/client/register', payload).then((res) => res.data)
}

export function loginClient(payload) {
  return api.post('/auth/client/login', payload).then((res) => res.data)
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
