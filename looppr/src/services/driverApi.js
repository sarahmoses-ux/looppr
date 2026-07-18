import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Dedicated axios instance for the Driver Portal — own in-memory access
// token and own refresh endpoint (/driver-auth/refresh), fully separate from
// the customer/business/partner instances. Keeps a driver session from
// clashing with any other session in the same browser.
export const driverApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let onAuthFailure = null

export function setDriverAccessToken(token) {
  accessToken = token
}

export function getDriverAccessToken() {
  return accessToken
}

export function setDriverAuthFailureHandler(fn) {
  onAuthFailure = fn
}

driverApi.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

driverApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRoute = original?.url?.includes('/driver-auth/')

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        refreshPromise ??= driverApi.post('/driver-auth/refresh').finally(() => {
          refreshPromise = null
        })
        const { data } = await refreshPromise
        setDriverAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return driverApi(original)
      } catch (refreshError) {
        setDriverAccessToken(null)
        onAuthFailure?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
