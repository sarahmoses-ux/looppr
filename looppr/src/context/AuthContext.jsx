import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAccessToken, setAuthFailureHandler } from '../services/api'
import {
  changePassword as changePasswordRequest,
  fetchMe,
  forgotPassword as forgotPasswordRequest,
  loginClient,
  logout as logoutRequest,
  refreshSession,
  registerClient,
  resendLoginOtp,
  resetPassword as resetPasswordRequest,
  updateProfile as updateProfileRequest,
  verifyLoginOtp,
} from '../services/authApi'
import { loginAdmin, resendAdminLoginOtp, verifyAdminLoginOtp } from '../services/adminAuthApi'

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

  // Admin equivalents of login/completeLogin/resendLoginCode above — same
  // two-step password + emailed-OTP flow, just hitting the /admin/* auth
  // endpoints, which only ever succeed for role: 'admin' accounts.
  async function adminLogin(payload) {
    return loginAdmin(payload)
  }

  async function completeAdminLogin(challengeToken, code) {
    const { accessToken, user: loggedInUser } = await verifyAdminLoginOtp(challengeToken, code)
    setAccessToken(accessToken)
    setUser(loggedInUser)
    setStatus('authenticated')
  }

  async function resendAdminLoginCode(challengeToken) {
    return resendAdminLoginOtp(challengeToken)
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

  // Used by both Profile.jsx (name/phone) and Settings.jsx
  // (emailNotifications) — same partial-update endpoint either way.
  async function updateProfile(payload) {
    const { user: updated } = await updateProfileRequest(payload)
    setUser(updated)
    return updated
  }

  // Changing the password invalidates every other session (see backend's
  // tokenVersion check on refresh) and re-issues a fresh token for this
  // one, so it needs to be stored here too or this tab's session would
  // silently stop being refreshable in 15 minutes.
  async function changePassword(payload) {
    const { accessToken } = await changePasswordRequest(payload)
    setAccessToken(accessToken)
  }

  // Step 1 of "forgot password": always resolves the same way regardless of
  // whether the email exists (the backend never reveals that either).
  async function forgotPassword(email) {
    return forgotPasswordRequest(email)
  }

  // Step 2: verifying the code + new password also signs the user in
  // directly (they've proven email ownership), same session shape as
  // completeLogin/register.
  async function resetPassword(payload) {
    const { accessToken, user: loggedInUser } = await resetPasswordRequest(payload)
    setAccessToken(accessToken)
    setUser(loggedInUser)
    setStatus('authenticated')
  }

  const value = useMemo(
    () => ({
      user,
      status,
      register,
      login,
      completeLogin,
      resendLoginCode,
      adminLogin,
      completeAdminLogin,
      resendAdminLoginCode,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
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
