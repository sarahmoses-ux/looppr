import { api } from './api'

export function joinWaitlist(email) {
  return api.post('/waitlist', { email }).then((res) => res.data)
}
