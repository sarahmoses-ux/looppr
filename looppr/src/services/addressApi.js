import { api } from './api'

export function fetchAddresses() {
  return api.get('/addresses').then((res) => res.data)
}

export function saveAddress(payload) {
  return api.post('/addresses', payload).then((res) => res.data)
}

export function deleteAddress(id) {
  return api.delete(`/addresses/${id}`).then((res) => res.data)
}
