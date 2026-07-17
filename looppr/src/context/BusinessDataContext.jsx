import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchBusinessOverview, fetchBusinessPickups } from '../services/businessDashboardApi'

const BusinessDataContext = createContext(null)

// Promise-chain (not async/await) so setState only ever happens inside a
// `.then` callback — mirrors AuthContext and keeps the effect free of
// synchronous state updates.
function loadData() {
  return Promise.all([fetchBusinessOverview(), fetchBusinessPickups()])
}

// Fetches the dashboard's shared data (overview stats + the pickup list) once
// at the layout level and exposes it to every section, so navigating between
// sidebar items doesn't refetch. `reload()` is called after a new pickup is
// requested so the numbers and tables update immediately.
export function BusinessDataProvider({ children }) {
  const [overview, setOverview] = useState(null)
  const [pickups, setPickups] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  const reload = useCallback(() => {
    return loadData()
      .then(([overviewRes, pickupsRes]) => {
        setOverview(overviewRes.overview)
        setPickups(pickupsRes.pickups)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    let cancelled = false
    loadData()
      .then(([overviewRes, pickupsRes]) => {
        if (cancelled) return
        setOverview(overviewRes.overview)
        setPickups(pickupsRes.pickups)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <BusinessDataContext.Provider value={{ overview, pickups, status, reload }}>
      {children}
    </BusinessDataContext.Provider>
  )
}

export function useBusinessData() {
  const ctx = useContext(BusinessDataContext)
  if (!ctx) throw new Error('useBusinessData must be used within a BusinessDataProvider')
  return ctx
}
