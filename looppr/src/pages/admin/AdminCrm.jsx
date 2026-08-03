import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/SEO'
import { useToast } from '../../context/ToastContext'
import { fetchBusinessAccounts, fetchBusinessLeads, markBusinessLeadContacted } from '../../services/adminApi'

const ACCOUNT_STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  active: 'bg-success-soft text-success-dark',
  suspended: 'bg-red-50 text-red-700',
  inactive: 'bg-ink/5 text-ink/55',
}

function currency(amount) {
  return `$${(amount || 0).toFixed(2)}`
}

function LeadRow({ lead, onContacted }) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)
  const when = new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  async function handleMarkContacted() {
    setBusy(true)
    try {
      const { lead: updated } = await markBusinessLeadContacted(lead._id)
      onContacted(updated)
    } catch {
      showToast('Could not mark this lead contacted. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {lead.businessName || lead.name}
          <span className="font-normal text-ink/45"> · {lead.name}</span>
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {lead.email} · {lead.phone} · {when}
        </p>
        {lead.message && <p className="mt-1.5 text-sm text-ink/70">{lead.message}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {lead.contacted ? (
          <span className="rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success-dark">
            Contacted
          </span>
        ) : (
          <button
            type="button"
            onClick={handleMarkContacted}
            disabled={busy}
            className="rounded-full bg-periwinkle px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Marking…' : 'Mark contacted'}
          </button>
        )}
      </div>
    </div>
  )
}

function LeadsTab() {
  const [leads, setLeads] = useState(null)
  const [statusFilter, setStatusFilter] = useState('open')

  useEffect(() => {
    let cancelled = false
    fetchBusinessLeads({ status: statusFilter || undefined })
      .then(({ leads: list }) => {
        if (!cancelled) setLeads(list)
      })
      .catch(() => {
        if (!cancelled) setLeads([])
      })
    return () => {
      cancelled = true
    }
  }, [statusFilter])

  function handleContacted(updated) {
    setLeads((list) => {
      if (statusFilter === 'open') return list.filter((l) => l._id !== updated._id)
      return list.map((l) => (l._id === updated._id ? updated : l))
    })
  }

  const openCount = leads?.filter((l) => !l.contacted).length ?? null

  return (
    <>
      <div className="mt-4 flex rounded-full bg-linen p-1 w-fit">
        {[
          { value: 'open', label: 'Open' },
          { value: 'contacted', label: 'Contacted' },
          { value: '', label: 'All' },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setStatusFilter(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              statusFilter === t.value ? 'bg-white text-ink shadow-sm' : 'text-ink/55'
            }`}
          >
            {t.label}
            {t.value === 'open' && openCount ? ` (${openCount})` : ''}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {leads === null ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : leads.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">
            {statusFilter === 'open' ? "Nothing open — you're all caught up." : 'No leads here.'}
          </p>
        ) : (
          <div className="space-y-3">
            {leads.map((l) => (
              <LeadRow key={l._id} lead={l} onContacted={handleContacted} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function AccountsTab() {
  const [accounts, setAccounts] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchBusinessAccounts()
      .then(({ accounts: list }) => {
        if (!cancelled) setAccounts(list)
      })
      .catch(() => {
        if (!cancelled) setAccounts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!accounts) return []
    const term = search.trim().toLowerCase()
    if (!term) return accounts
    return accounts.filter((a) =>
      [a.businessName, a.contactPerson, a.email].filter(Boolean).join(' ').toLowerCase().includes(term),
    )
  }, [accounts, search])

  return (
    <>
      {accounts && accounts.length > 0 && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business, contact, or email…"
          className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle sm:max-w-xs"
        />
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white">
        {accounts === null ? (
          <div className="space-y-3 p-6">
            <div className="h-10 animate-pulse rounded-xl bg-linen-soft" />
            <div className="h-10 animate-pulse rounded-xl bg-linen-soft" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">
            {accounts.length === 0 ? 'No business accounts have signed up yet.' : 'No accounts match your search.'}
          </p>
        ) : (
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink/45">
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Weekly volume</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Lifetime spend</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((a) => (
                <tr key={a._id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{a.businessName}</p>
                    <p className="text-xs capitalize text-ink/50">{a.businessType?.replace('_', ' ')}</p>
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">
                    <p>{a.contactPerson}</p>
                    <p className="text-xs text-ink/50">
                      {a.email} · {a.phone}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">{a.weeklyVolume || '—'}</td>
                  <td className="px-5 py-3.5 text-ink/70">{a.orderCount}</td>
                  <td className="px-5 py-3.5 text-ink/70">{currency(a.totalSpent)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ACCOUNT_STATUS_STYLES[a.accountStatus] || 'bg-ink/5 text-ink/60'}`}
                    >
                      {a.accountStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default function AdminCrm() {
  const [tab, setTab] = useState('leads')

  return (
    <>
      <SEO title="CRM & Pipeline" description="B2B leads and business accounts." noindex />

      <div className="flex rounded-full bg-linen p-1 w-fit">
        {[
          { value: 'leads', label: 'Leads' },
          { value: 'accounts', label: 'Accounts' },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.value ? 'bg-white text-ink shadow-sm' : 'text-ink/55'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'leads' ? <LeadsTab /> : <AccountsTab />}
    </>
  )
}
