import { api } from './api'

export function submitPartnerLead(payload) {
  return api.post('/partner-leads', payload).then((res) => res.data)
}
