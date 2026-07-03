import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAccessToken, setAuthFailureHandler } from '../services/api'
import {
  fetchMe,
  loginClient,
  logout as logoutRequest,
  refreshSession,
  registerClient,
  resendLoginOtp,
  verifyLoginOtp,
} from '../services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null)
      setStatus('guest')
    })
  }, [])

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

  // Step 1: password check. Does NOT complete sign-in — the backend emails
  // an OTP and returns a challengeToken that must be verified next.
  async function login(payload) {
    return loginClient(payload)
  }

  // Step 2: completes sign-in once the emailed OTP is verified.
  async function completeLogin(challengeToken, code) {
    const { accessToken, user: loggedInUser } = await verifyLoginOtp(challengeToken, code)
    setAccessToken(accessToken)
    setUser(loggedInUser)
    setStatus('authenticated')
  }

  async function resendLoginCode(challengeToken) {
    return resendLoginOtp(challengeToken)
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
    () => ({
      user,
      status,
      register,
      login,
      completeLogin,
      resendLoginCode,
      logout,
      refreshUser,
      setUser,
    }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
