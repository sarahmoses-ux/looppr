import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  fetchIncomingOrders,
  fetchMyOrders,
  fetchPartnerEarnings,
  fetchPartnerOverview,
} from '../services/partnerDashboardApi'

const PartnerDataContext = createContext(null)

function loadData() {
  return Promise.all([
    fetchPartnerOverview(),
    fetchIncomingOrders(),
    fetchMyOrders(),
    fetchPartnerEarnings(),
  ])
}

// Loads the partner dashboard's shared data (overview, incoming + claimed
// orders, earnings) once at the layout level and shares it across sections.
// reload() runs after any order action so numbers/tables stay in sync.
export function PartnerDataProvider({ children }) {
  const [overview, setOverview] = useState(null)
  const [incoming, setIncoming] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [earnings, setEarnings] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error

  const apply = ([o, inc, mine, earn]) => {
    setOverview(o.overview)
    setIncoming(inc.orders)
    setMyOrders(mine.orders)
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
    <PartnerDataContext.Provider value={{ overview, incoming, myOrders, earnings, status, reload }}>
      {children}
    </PartnerDataContext.Provider>
  )
}

export function usePartnerData() {
  const ctx = useContext(PartnerDataContext)
  if (!ctx) throw new Error('usePartnerData must be used within a PartnerDataProvider')
  return ctx
}
