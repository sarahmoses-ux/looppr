import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  fetchDriverEarnings,
  fetchDriverOverview,
  fetchIncomingDeliveries,
  fetchMyDeliveries,
} from '../services/driverDashboardApi'

const DriverDataContext = createContext(null)

function loadData() {
  return Promise.all([
    fetchDriverOverview(),
    fetchIncomingDeliveries(),
    fetchMyDeliveries(),
    fetchDriverEarnings(),
  ])
}

// Loads the driver dashboard's shared data (overview, incoming + claimed
// deliveries, earnings) once at the layout level and shares it across
// sections. reload() runs after any delivery action so numbers/tables stay
// in sync.
export function DriverDataProvider({ children }) {
  const [overview, setOverview] = useState(null)
  const [incoming, setIncoming] = useState([])
  const [myDeliveries, setMyDeliveries] = useState([])
  const [earnings, setEarnings] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error

  const apply = ([o, inc, mine, earn]) => {
    setOverview(o.overview)
    setIncoming(inc.deliveries)
    setMyDeliveries(mine.deliveries)
    setEarnings(earn.earnings)
    setStatus('ready')
  }

  const reload = useCallback(() => {
    return loadData()
      .then(apply)
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    let cancelled = false
    loadData()
      .then((r) => {
        if (!cancelled) apply(r)
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DriverDataContext.Provider value={{ overview, incoming, myDeliveries, earnings, status, reload }}>
      {children}
    </DriverDataContext.Provider>
  )
}

export function useDriverData() {
  const ctx = useContext(DriverDataContext)
  if (!ctx) throw new Error('useDriverData must be used within a DriverDataProvider')
  return ctx
}
