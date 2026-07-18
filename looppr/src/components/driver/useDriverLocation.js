import { useEffect, useRef, useState } from 'react'
import { updateLocation } from '../../services/driverDashboardApi'

const MIN_REPORT_INTERVAL_MS = 20_000

// Shares the driver's live browser location with the backend while `enabled`
// (tied to the Online/Offline toggle) — this is what populates
// DriverUser.location for the future proximity-based assignment engine.
// Uses watchPosition (fires on movement) but throttles outbound requests to
// at most one per MIN_REPORT_INTERVAL_MS, well under the server's rate limit
// and kinder to battery than posting on every GPS tick.
export function useDriverLocation(enabled) {
  // Lazy initializer so the support check runs once at mount, never as a
  // synchronous setState inside the effect body below.
  const [permission, setPermission] = useState(() =>
    'geolocation' in navigator ? 'idle' : 'unsupported',
  ) // idle | granted | denied | unsupported
  const lastSentAt = useRef(0)
  const watchId = useRef(null)

  useEffect(() => {
    if (!enabled || permission === 'unsupported') {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
      return undefined
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setPermission('granted')
        const now = Date.now()
        if (now - lastSentAt.current < MIN_REPORT_INTERVAL_MS) return
        lastSentAt.current = now
        const { latitude, longitude } = position.coords
        updateLocation(latitude, longitude).catch(() => {})
      },
      () => setPermission('denied'),
      { enableHighAccuracy: false, maximumAge: 15_000, timeout: 20_000 },
    )

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }
    }
  }, [enabled, permission])

  return { permission }
}
