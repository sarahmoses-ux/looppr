import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setPartnerAccessToken, setPartnerAuthFailureHandler } from '../services/partnerApi'
import {
  fetchPartnerMe,
  loginPartner,
  logoutPartner,
  partnerForgotPassword as forgotPasswordRequest,
  partnerResetPassword as resetPasswordRequest,
  refreshPartnerSession,
  registerPartner,
  resendPartnerVerification,
  verifyPartnerEmail,
} from '../services/partnerAuthApi'

const PartnerAuthContext = createContext(null)

// Standalone auth provider for the Partner Portal — its own `partner` + status,
// talks only to the partnerApi instance, isolated from customer/business auth.
export function PartnerAuthProvider({ children }) {
  const [partner, setPartner] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest

  useEffect(() => {
    setPartnerAuthFailureHandler(() => {
      setPartner(null)
      setStatus('guest')
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    refreshPartnerSession()
      .then(({ accessToken, partner: sessionPartner }) => {
        if (cancelled) return
        setPartnerAccessToken(accessToken)
        setPartner(sessionPartner)
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
    return registerPartner(payload)
  }

  async function login(payload) {
    const data = await loginPartner(payload)
    if (data.requiresVerification) return data
    setPartnerAccessToken(data.accessToken)
    setPartner(data.partner)
    setStatus('authenticated')
    return data
  }

  async function verifyEmail(email, code) {
    const { accessToken, partner: verified } = await verifyPartnerEmail(email, code)
    setPartnerAccessToken(accessToken)
    setPartner(verified)
    setStatus('authenticated')
  }

  async function resendVerification(email) {
    return resendPartnerVerification(email)
  }

  async function logout() {
    await logoutPartner().catch(() => {})
    setPartnerAccessToken(null)
    setPartner(null)
    setStatus('guest')
  }

  async function refreshPartner() {
    const { partner: fresh } = await fetchPartnerMe()
    setPartner(fresh)
  }

  async function forgotPassword(email) {
    return forgotPasswordRequest(email)
  }

  async function resetPassword(payload) {
    const { accessToken, partner: reset } = await resetPasswordRequest(payload)
    setPartnerAccessToken(accessToken)
    setPartner(reset)
    setStatus('authenticated')
  }

  const value = useMemo(
    () => ({
      partner,
      status,
      register,
      login,
      verifyEmail,
      resendVerification,
      logout,
      refreshPartner,
      forgotPassword,
      resetPassword,
      setPartner,
    }),
    [partner, status],
  )

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext)
  if (!ctx) throw new Error('usePartnerAuth must be used within a PartnerAuthProvider')
  return ctx
}
