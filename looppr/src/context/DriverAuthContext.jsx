import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setDriverAccessToken, setDriverAuthFailureHandler } from '../services/driverApi'
import {
  driverForgotPassword as forgotPasswordRequest,
  driverResetPassword as resetPasswordRequest,
  fetchDriverMe,
  loginDriver,
  logoutDriver,
  refreshDriverSession,
  registerDriver,
  resendDriverVerification,
  verifyDriverEmail,
} from '../services/driverAuthApi'

const DriverAuthContext = createContext(null)

// Standalone auth provider for the Driver Portal — its own `driver` + status,
// talks only to the driverApi instance, isolated from customer/business/
// partner auth.
export function DriverAuthProvider({ children }) {
  const [driver, setDriver] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | guest

  useEffect(() => {
    setDriverAuthFailureHandler(() => {
      setDriver(null)
      setStatus('guest')
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    refreshDriverSession()
      .then(({ accessToken, driver: sessionDriver }) => {
        if (cancelled) return
        setDriverAccessToken(accessToken)
        setDriver(sessionDriver)
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
    return registerDriver(payload)
  }

  async function login(payload) {
    const data = await loginDriver(payload)
    // None of these issue a session — only an 'active' account gets one
    // (see driverLogin in the backend). Return the flagged response as-is
    // so the caller (DriverLogin.jsx) can show the right message.
    if (data.requiresVerification || data.pendingApproval || data.applicationRejected) return data
    setDriverAccessToken(data.accessToken)
    setDriver(data.driver)
    setStatus('authenticated')
    return data
  }

  async function verifyEmail(email, code) {
    const data = await verifyDriverEmail(email, code)
    // A pending/rejected application gets no session (see driverVerifyEmail
    // in the backend) — return the response so the caller can navigate to
    // the application-submitted screen instead of the dashboard.
    if (data.pendingApproval || data.applicationRejected) return data
    setDriverAccessToken(data.accessToken)
    setDriver(data.driver)
    setStatus('authenticated')
    return data
  }

  async function resendVerification(email) {
    return resendDriverVerification(email)
  }

  async function logout() {
    await logoutDriver().catch(() => {})
    setDriverAccessToken(null)
    setDriver(null)
    setStatus('guest')
  }

  async function refreshDriver() {
    const { driver: fresh } = await fetchDriverMe()
    setDriver(fresh)
  }

  async function forgotPassword(email) {
    return forgotPasswordRequest(email)
  }

  async function resetPassword(payload) {
    const { accessToken, driver: reset } = await resetPasswordRequest(payload)
    setDriverAccessToken(accessToken)
    setDriver(reset)
    setStatus('authenticated')
  }

  const value = useMemo(
    () => ({
      driver,
      status,
      register,
      login,
      verifyEmail,
      resendVerification,
      logout,
      refreshDriver,
      forgotPassword,
      resetPassword,
      setDriver,
    }),
    [driver, status],
  )

  return <DriverAuthContext.Provider value={value}>{children}</DriverAuthContext.Provider>
}

export function useDriverAuth() {
  const ctx = useContext(DriverAuthContext)
  if (!ctx) throw new Error('useDriverAuth must be used within a DriverAuthProvider')
  return ctx
}
