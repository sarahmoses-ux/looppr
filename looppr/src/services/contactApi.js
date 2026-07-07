import { api } from './api'

export function submitContactMessage(payload) {
  return api.post('/contact', payload).then((res) => res.data)
}
