import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// A dedicated axios instance for the Business Portal — its own in-memory
// access token and its own refresh endpoint (/business-auth/refresh), fully
// separate from the customer/admin instance in services/api.js. This is what
// lets a user be signed into the customer app and the Business Portal in the
// same browser tab without the two sessions overwriting each other.
export const businessApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let onAuthFailure = null

export function setBusinessAccessToken(token) {
  accessToken = token
}

export function getBusinessAccessToken() {
  return accessToken
}

export function setBusinessAuthFailureHandler(fn) {
  onAuthFailure = fn
}

businessApi.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

businessApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRoute = original?.url?.includes('/business-auth/')

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        refreshPromise ??= businessApi.post('/business-auth/refresh').finally(() => {
          refreshPromise = null
        })
        const { data } = await refreshPromise
        setBusinessAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return businessApi(original)
      } catch (refreshError) {
        setBusinessAccessToken(null)
        onAuthFailure?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
