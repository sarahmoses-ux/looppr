import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import { useToast } from '../../context/ToastContext'
import { fetchContactMessages, resolveContactMessage } from '../../services/adminApi'

// Mirrors src/pages/Contact.jsx's PURPOSES — keep both in sync manually.
const PURPOSE_LABELS = {
  general: 'General question',
  order_support: 'Order support',
  business: 'Business inquiry',
  partnership: 'Partnership inquiry',
  press: 'Press / media',
  other: 'Other',
}

function MessageRow({ message, onResolve }) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)
  const when = new Date(message.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  async function handleResolve() {
    setBusy(true)
    try {
      const { message: updated } = await resolveContactMessage(message._id)
      onResolve(updated)
    } catch {
      showToast('Could not mark this handled. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {PURPOSE_LABELS[message.purpose] || message.purpose}
          <span className="font-normal text-ink/45"> · {message.name}</span>
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {message.email} · {message.phone} · Contact form · {when}
        </p>
        {message.message && <p className="mt-1.5 text-sm text-ink/70">{message.message}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {message.handled ? (
          <span className="rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success-dark">
            Handled
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResolve}
            disabled={busy}
            className="rounded-full bg-periwinkle px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Marking…' : 'Mark handled'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminCustomerCare() {
  const [messages, setMessages] = useState(null)
  const [statusFilter, setStatusFilter] = useState('open')

  useEffect(() => {
    let cancelled = false
    fetchContactMessages({ status: statusFilter || undefined })
      .then(({ messages: list }) => {
        if (!cancelled) setMessages(list)
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
    return () => {
      cancelled = true
    }
  }, [statusFilter])

  function handleResolve(updated) {
    setMessages((list) => {
      if (statusFilter === 'open') return list.filter((m) => m._id !== updated._id)
      return list.map((m) => (m._id === updated._id ? updated : m))
    })
  }

  const openCount = messages?.filter((m) => !m.handled).length ?? null

  return (
    <>
      <SEO title="Customer Care" description="Contact form requests from the Looppr website." noindex />
      <p className="text-sm text-ink/55">Requests submitted through the getlooppr.com contact form.</p>

      <div className="mt-6 flex rounded-full bg-linen p-1 w-fit">
        {[
          { value: 'open', label: 'Open' },
          { value: 'handled', label: 'Handled' },
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
        {messages === null ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-20 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">
            {statusFilter === 'open' ? "Nothing open — you're all caught up." : 'No messages here.'}
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <MessageRow key={m._id} message={m} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
