import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import { fetchIntakeStats } from '../../services/adminApi'

export default function AdminDataCollection() {
  const [intakePoints, setIntakePoints] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchIntakeStats()
      .then(({ intakePoints: list }) => {
        if (!cancelled) setIntakePoints(list)
      })
      .catch(() => {
        if (!cancelled) setIntakePoints([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <SEO title="Data Collection" description="Every Looppr intake point, in one view." noindex />
      <p className="text-sm text-ink/55">Every form and signup point across the site, and how much it's capturing.</p>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white">
        {intakePoints === null ? (
          <div className="space-y-3 p-6">
            <div className="h-10 animate-pulse rounded-xl bg-linen-soft" />
            <div className="h-10 animate-pulse rounded-xl bg-linen-soft" />
            <div className="h-10 animate-pulse rounded-xl bg-linen-soft" />
          </div>
        ) : (
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink/45">
                <th className="px-5 py-3">Form</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Submissions (30d)</th>
                <th className="px-5 py-3">All time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {intakePoints.map((p) => (
                <tr key={p.key}>
                  <td className="px-5 py-3.5 font-medium text-ink">{p.label}</td>
                  <td className="px-5 py-3.5 text-ink/55">{p.location}</td>
                  <td className="px-5 py-3.5 text-ink/70">{p.last30}</td>
                  <td className="px-5 py-3.5 text-ink/70">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
