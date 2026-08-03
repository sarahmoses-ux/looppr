import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/SEO'
import { fetchAllPickups } from '../../services/adminApi'

const WINDOWS = [
  { value: 'morning', label: 'Morning', time: '8–11 AM' },
  { value: 'afternoon', label: 'Afternoon', time: '12–3 PM' },
  { value: 'evening', label: 'Evening', time: '4–7 PM' },
]

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildWeek() {
  const today = startOfDay(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })
}

export default function AdminBookings() {
  const [pickups, setPickups] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchAllPickups()
      .then(({ pickups: list }) => {
        if (!cancelled) setPickups(list)
      })
      .catch(() => {
        if (!cancelled) setPickups([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const week = useMemo(() => buildWeek(), [])

  const byDay = useMemo(() => {
    if (!pickups) return null
    return week.map((day) => {
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const dayPickups = pickups.filter((p) => {
        if (p.status === 'cancelled') return false
        const d = new Date(p.preferredDate)
        return d >= day && d < next
      })
      return {
        day,
        slots: WINDOWS.map((w) => ({
          ...w,
          pickups: dayPickups.filter((p) => p.window === w.value),
        })),
      }
    })
  }, [pickups, week])

  return (
    <>
      <SEO title="Bookings" description="Upcoming Looppr pickup windows for the next 7 days." noindex />
      <p className="text-sm text-ink/55">Pickup windows for the next 7 days, synced to order data.</p>

      {byDay === null ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-linen-soft" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {byDay.map(({ day, slots }) => {
            const isToday = day.getTime() === startOfDay(new Date()).getTime()
            return (
              <div
                key={day.toISOString()}
                className={`min-h-55 rounded-2xl border p-3 ${isToday ? 'border-periwinkle bg-periwinkle-soft/40' : 'border-line bg-white'}`}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-periwinkle-text">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="mb-2.5 font-display text-lg font-semibold text-ink">
                  {day.toLocaleDateString(undefined, { day: 'numeric' })}
                </p>
                <div className="flex flex-col gap-1.5">
                  {slots.map((slot) =>
                    slot.pickups.length === 0 ? null : (
                      <div key={slot.value} className="rounded-lg bg-linen px-2 py-1.5">
                        <p className="text-[10px] font-bold text-periwinkle-text">{slot.time}</p>
                        {slot.pickups.map((p) => (
                          <p key={p._id} className="truncate text-[11px] text-ink/70">
                            {(p.clientId || p.guest)?.name || 'Unknown'}
                          </p>
                        ))}
                      </div>
                    ),
                  )}
                  {slots.every((s) => s.pickups.length === 0) && (
                    <p className="py-4 text-center text-[11px] text-ink/35">No pickups</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
