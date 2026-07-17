import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  setBusinessAccessToken,
  setBusinessAuthFailureHandler,
} from '../services/businessApi'
import {
  businessForgotPassword as forgotPasswordRequest,
  businessResetPassword as resetPasswordRequest,
  fetchBusinessMe,
  loginBusiness,
  logoutBusiness,
  refreshBusinessSession,
  registerBusiness,
  resendBusinessVerification,
  updateBusinessProfile,
  verifyBusinessEmail,
} from '../services/businessAuthApi'

const BusinessAuthContext = createContext(null)

// Standalone auth provider for the Business Portal — deliberately NOT the same
// as the customer AuthContext. It holds its own `business` + status and talks
// only to the businessApi instance, so the two sessions never interfere.
export function BusinessAuthProvider({ children }) {
  const [business, setBusiness] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest

  useEffect(() => {
    setBusinessAuthFailureHandler(() => {
      setBusiness(null)
      setStatus('guest')
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    refreshBusinessSession()
      .then(({ accessToken, business: sessionBusiness }) => {
        if (cancelled) return
        setBusinessAccessToken(accessToken)
        setBusiness(sessionBusiness)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) setStatus('guest')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Step 1: create account. Returns { requiresVerification, email } — no
  // session yet, the email must be verified first.
  async function register(payload) {
    return registerBusiness(payload)
  }

  // Password-only login. Returns { requiresVerification } for unverified
  // accounts (frontend routes to the verify page); otherwise establishes the
  // session here.
  async function login(payload) {
    const data = await loginBusiness(payload)
    if (data.requiresVerification) return data
    setBusinessAccessToken(data.accessToken)
    setBusiness(data.business)
    setStatus('authenticated')
    return data
  }

  async function verifyEmail(email, code) {
    const { accessToken, business: verified } = await verifyBusinessEmail(email, code)
    setBusinessAccessToken(accessToken)
    setBusiness(verified)
    setStatus('authenticated')
  }

  async function resendVerification(email) {
    return resendBusinessVerification(email)
  }

  async function logout() {
    await logoutBusiness().catch(() => {})
    setBusinessAccessToken(null)
    setBusiness(null)
    setStatus('guest')
  }

  async function refreshBusiness() {
    const { business: fresh } = await fetchBusinessMe()
    setBusiness(fresh)
  }

  async function updateProfile(payload) {
    const { business: updated } = await updateBusinessProfile(payload)
    setBusiness(updated)
    return updated
  }

  async function forgotPassword(email) {
    return forgotPasswordRequest(email)
  }

  async function resetPassword(payload) {
    const { accessToken, business: reset } = await resetPasswordRequest(payload)
    setBusinessAccessToken(accessToken)
    setBusiness(reset)
    setStatus('authenticated')
  }

  const value = useMemo(
    () => ({
      business,
      status,
      register,
      login,
      verifyEmail,
      resendVerification,
      logout,
      refreshBusiness,
      updateProfile,
      forgotPassword,
      resetPassword,
      setBusiness,
    }),
    [business, status],
  )

  return <BusinessAuthContext.Provider value={value}>{children}</BusinessAuthContext.Provider>
}

export function useBusinessAuth() {
  const ctx = useContext(BusinessAuthContext)
  if (!ctx) throw new Error('useBusinessAuth must be used within a BusinessAuthProvider')
  return ctx
}
