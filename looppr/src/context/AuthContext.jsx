import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAccessToken } from '../services/api'
import {
  fetchMe,
  loginClient,
  logout as logoutRequest,
  refreshSession,
  registerClient,
} from '../services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest

  useEffect(() => {
    let cancelled = false
    refreshSession()
      .then(({ accessToken, user: sessionUser }) => {
        if (cancelled) return
        setAccessToken(accessToken)
        setUser(sessionUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) setStatus('guest')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function register(payload) {
    const { accessToken, user: newUser } = await registerClient(payload)
    setAccessToken(accessToken)
    setUser(newUser)
    setStatus('authenticated')
  }

  async function login(payload) {
    const { accessToken, user: loggedInUser } = await loginClient(payload)
    setAccessToken(accessToken)
    setUser(loggedInUser)
    setStatus('authenticated')
  }

  async function logout() {
    await logoutRequest().catch(() => {})
    setAccessToken(null)
    setUser(null)
    setStatus('guest')
  }

  async function refreshUser() {
    const { user: freshUser } = await fetchMe()
    setUser(freshUser)
  }

  const value = useMemo(
    () => ({ user, status, register, login, logout, refreshUser }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
