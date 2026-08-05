import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import { useToast } from '../../context/ToastContext'
import {
  advanceInvoiceStatus,
  fetchBusinessAccounts,
  fetchDriverApplications,
  fetchInvoices,
  fetchPartnerApplications,
  fetchPayouts,
  generateInvoice,
  generatePayout,
  markPayoutPaid,
} from '../../services/adminApi'

function currency(amount) {
  return `$${(amount || 0).toFixed(2)}`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const PAYOUT_STATUS_STYLES = { pending: 'bg-amber-50 text-amber-700', paid: 'bg-success-soft text-success-dark' }
const INVOICE_STATUS_STYLES = {
  draft: 'bg-ink/5 text-ink/55',
  sent: 'bg-periwinkle-soft text-periwinkle-text',
  paid: 'bg-success-soft text-success-dark',
}

// Shared by both the Partner Payouts and Driver Payouts tabs — same shape,
// just a different payeeType and options source.
function GeneratePayoutForm({ payeeType, payeeOptions, onGenerated }) {
  const { showToast } = useToast()
  const [payeeId, setPayeeId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { payout } = await generatePayout({ payeeType, payeeId, periodStart, periodEnd })
      onGenerated(payout)
      showToast(`Payout of ${currency(payout.amount)} generated.`, 'success')
      setPayeeId('')
      setPeriodStart('')
      setPeriodEnd('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not generate this payout. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-3 rounded-3xl border border-line bg-white p-6 sm:grid-cols-4 sm:items-end"
    >
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink/55">
          {payeeType === 'partner' ? 'Partner' : 'Driver'}
        </span>
        <select
          required
          value={payeeId}
          onChange={(e) => setPayeeId(e.target.value)}
          className="w-full rounded-xl border border-line bg-linen px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        >
          <option value="">Select…</option>
          {payeeOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.businessName || p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-semibold text-ink/55">Period start</span>
        <input
          type="date"
          required
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="w-full rounded-xl border border-line bg-linen px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-semibold text-ink/55">Period end</span>
        <input
          type="date"
          required
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="w-full rounded-xl border border-line bg-linen px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-periwinkle px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:col-span-4 sm:w-fit"
      >
        {busy ? 'Generating…' : 'Generate payout'}
      </button>
    </form>
  )
}

function PayoutRow({ payout, onMarkPaid }) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)

  async function handleMarkPaid() {
    setBusy(true)
    try {
      await onMarkPaid(payout._id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not mark this payout paid. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {payout.payeeName}
          <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYOUT_STATUS_STYLES[payout.status]}`}>
            {payout.status === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {formatDate(payout.periodStart)} – {formatDate(payout.periodEnd)} · {payout.orderCount} order
          {payout.orderCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className="text-lg font-semibold text-ink">{currency(payout.amount)}</p>
        {payout.status === 'pending' && (
          <button
            type="button"
            onClick={handleMarkPaid}
            disabled={busy}
            className="rounded-full bg-success-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Marking…' : 'Mark paid'}
          </button>
        )}
      </div>
    </div>
  )
}

function PayoutsTab({ payeeType }) {
  const [payeeOptions, setPayeeOptions] = useState([])
  const [payouts, setPayouts] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchOptions = payeeType === 'partner' ? fetchPartnerApplications : fetchDriverApplications
    fetchOptions({ status: 'active' })
      .then((data) => {
        if (!cancelled) setPayeeOptions(payeeType === 'partner' ? data.partners : data.drivers)
      })
      .catch(() => {})
    fetchPayouts({ payeeType })
      .then(({ payouts: list }) => {
        if (!cancelled) setPayouts(list)
      })
      .catch(() => {
        if (!cancelled) setPayouts([])
      })
    return () => {
      cancelled = true
    }
  }, [payeeType])

  function handleGenerated(payout) {
    setPayouts((list) => [{ ...payout, payeeName: payeeOptions.find((p) => p.id === payout.payeeId)?.businessName || payeeOptions.find((p) => p.id === payout.payeeId)?.name }, ...(list || [])])
  }

  async function handleMarkPaid(id) {
    const { payout } = await markPayoutPaid(id)
    setPayouts((list) => list.map((p) => (p._id === payout._id ? { ...p, ...payout } : p)))
  }

  return (
    <>
      <GeneratePayoutForm payeeType={payeeType} payeeOptions={payeeOptions} onGenerated={handleGenerated} />

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {payouts === null ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : payouts.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No payouts generated yet.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <PayoutRow key={p._id} payout={p} onMarkPaid={handleMarkPaid} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function GenerateInvoiceForm({ businesses, onGenerated }) {
  const { showToast } = useToast()
  const [businessId, setBusinessId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { invoice } = await generateInvoice({ businessId, periodStart, periodEnd })
      onGenerated(invoice)
      showToast(`${invoice.invoiceNumber} generated for ${currency(invoice.amount)}.`, 'success')
      setBusinessId('')
      setPeriodStart('')
      setPeriodEnd('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not generate this invoice. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-3 rounded-3xl border border-line bg-white p-6 sm:grid-cols-4 sm:items-end"
    >
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink/55">Business</span>
        <select
          required
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          className="w-full rounded-xl border border-line bg-linen px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        >
          <option value="">Select…</option>
          {businesses.map((b) => (
            <option key={b._id} value={b._id}>
              {b.businessName}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-semibold text-ink/55">Period start</span>
        <input
          type="date"
          required
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="w-full rounded-xl border border-line bg-linen px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-semibold text-ink/55">Period end</span>
        <input
          type="date"
          required
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="w-full rounded-xl border border-line bg-linen px-3 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-periwinkle px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:col-span-4 sm:w-fit"
      >
        {busy ? 'Generating…' : 'Generate invoice'}
      </button>
    </form>
  )
}

const NEXT_STATUS_LABEL = { draft: 'Mark sent', sent: 'Mark paid' }
const NEXT_STATUS_VALUE = { draft: 'sent', sent: 'paid' }

function InvoiceRow({ invoice, onAdvance }) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)

  async function handleAdvance() {
    setBusy(true)
    try {
      await onAdvance(invoice._id, NEXT_STATUS_VALUE[invoice.status])
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update this invoice. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {invoice.invoiceNumber}
          <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${INVOICE_STATUS_STYLES[invoice.status]}`}>
            {invoice.status}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-ink/70">{invoice.businessId?.businessName || 'Unknown business'}</p>
        <p className="mt-0.5 text-sm text-ink/55">
          {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)} · {invoice.orderCount} order
          {invoice.orderCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className="text-lg font-semibold text-ink">{currency(invoice.amount)}</p>
        {NEXT_STATUS_LABEL[invoice.status] && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={busy}
            className="rounded-full bg-success-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Updating…' : NEXT_STATUS_LABEL[invoice.status]}
          </button>
        )}
      </div>
    </div>
  )
}

function InvoicesTab() {
  const [businesses, setBusinesses] = useState([])
  const [invoices, setInvoices] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchBusinessAccounts()
      .then(({ accounts }) => {
        if (!cancelled) setBusinesses(accounts)
      })
      .catch(() => {})
    fetchInvoices()
      .then(({ invoices: list }) => {
        if (!cancelled) setInvoices(list)
      })
      .catch(() => {
        if (!cancelled) setInvoices([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleGenerated(invoice) {
    const business = businesses.find((b) => b._id === invoice.businessId)
    setInvoices((list) => [{ ...invoice, businessId: business || invoice.businessId }, ...(list || [])])
  }

  async function handleAdvance(id, status) {
    const { invoice } = await advanceInvoiceStatus(id, status)
    setInvoices((list) => list.map((i) => (i._id === invoice._id ? { ...i, ...invoice } : i)))
  }

  return (
    <>
      <GenerateInvoiceForm businesses={businesses} onGenerated={handleGenerated} />

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {invoices === null ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No invoices generated yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((i) => (
              <InvoiceRow key={i._id} invoice={i} onAdvance={handleAdvance} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const TABS = [
  { value: 'partner', label: 'Partner Payouts' },
  { value: 'driver', label: 'Driver Payouts' },
  { value: 'invoices', label: 'Business Invoices' },
]

export default function AdminPayouts() {
  const [tab, setTab] = useState('partner')

  return (
    <>
      <SEO title="Payouts & Invoices" description="Generate and track partner/driver payouts and business invoices." noindex />

      <div className="flex rounded-full bg-linen p-1 w-fit">
        {TABS.map((t) => (
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

      {tab === 'partner' && <PayoutsTab payeeType="partner" />}
      {tab === 'driver' && <PayoutsTab payeeType="driver" />}
      {tab === 'invoices' && <InvoicesTab />}
    </>
  )
}
