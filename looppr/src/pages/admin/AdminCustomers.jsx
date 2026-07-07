import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/SEO'
import { fetchCustomers } from '../../services/adminApi'

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchCustomers()
      .then(({ customers: list }) => {
        if (!cancelled) setCustomers(list)
      })
      .catch(() => {
        if (!cancelled) setCustomers([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Client-side — same reasoning as Orders.jsx's own customer-facing search:
  // this list isn't large enough to justify a server round trip per keystroke.
  const filtered = useMemo(() => {
    if (!customers) return []
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q),
    )
  }, [customers, search])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Customers" description="All registered Looppr customers." noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Registered customers
      </h1>

      {customers && customers.length > 0 && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="mt-6 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle sm:max-w-xs"
        />
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white">
        {customers === null ? (
          <div className="space-y-3 p-6 sm:p-10">
            <div className="h-12 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-12 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-12 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : customers.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No registered customers yet.</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No customers match your search.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink/45">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total spent</th>
                <th className="px-5 py-3">Verified</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-5 py-3 text-ink/70">{c.email}</td>
                  <td className="px-5 py-3 text-ink/70">{c.phone}</td>
                  <td className="px-5 py-3 text-ink/70">{c.orderCount}</td>
                  <td className="px-5 py-3 text-ink/70">{formatMoney(c.totalSpent)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.isVerified ? 'bg-success-soft text-success-dark' : 'bg-ink/5 text-ink/50'
                      }`}
                    >
                      {c.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink/55">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
