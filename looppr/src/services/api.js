import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let onAuthFailure = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// Called when a refresh attempt fails mid-session (e.g. the refresh token is
// no longer valid) so the app can drop back to a signed-out state instead of
// silently leaving stale "authenticated" UI up.
export function setAuthFailureHandler(fn) {
  onAuthFailure = fn
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRoute = original?.url?.includes('/auth/')

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        refreshPromise ??= api.post('/auth/refresh').finally(() => {
          refreshPromise = null
        })
        const { data } = await refreshPromise
        setAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (refreshError) {
        setAccessToken(null)
        onAuthFailure?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
