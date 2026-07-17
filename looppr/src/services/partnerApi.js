import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Dedicated axios instance for the Partner Portal — own in-memory access
// token and own refresh endpoint (/partner-auth/refresh), fully separate from
// the customer and business instances. Keeps a partner session from clashing
// with any other session in the same browser.
export const partnerApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let onAuthFailure = null

export function setPartnerAccessToken(token) {
  accessToken = token
}

export function getPartnerAccessToken() {
  return accessToken
}

export function setPartnerAuthFailureHandler(fn) {
  onAuthFailure = fn
}

partnerApi.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

partnerApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRoute = original?.url?.includes('/partner-auth/')

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        refreshPromise ??= partnerApi.post('/partner-auth/refresh').finally(() => {
          refreshPromise = null
        })
        const { data } = await refreshPromise
        setPartnerAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return partnerApi(original)
      } catch (refreshError) {
        setPartnerAccessToken(null)
        onAuthFailure?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
